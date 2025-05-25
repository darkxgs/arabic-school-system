import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params
    const userId = request.nextUrl.searchParams.get('userId')
    const forceRefresh = request.nextUrl.searchParams.get('force') === 'true'
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      )
    }

    console.log(`[fix-points] Recalculating points for user ${userId}`)

    // Create admin client to bypass RLS
    const adminClient = await createAdminClient()

    // Check if points already exist in student_points first
    // Unless forceRefresh is true, in which case we always recalculate
    if (!forceRefresh) {
      const existingPoints = await getPointsFromStudentPointsTable(adminClient, userId)
      if (existingPoints !== null && existingPoints > 0) {
        return NextResponse.json({
          userId,
          method: 'student_points_table',
          totalPoints: existingPoints,
          transactionCount: 0,
          success: true
        })
      }
    }
    
    // Method 1: Direct SQL calculation (most reliable)
    try {
      console.log(`[fix-points] Attempting direct SQL calculation for ${userId}`)
      
      const { data: directSqlResult, error: directSqlError } = await adminClient.rpc('execute_raw_sql', {
        sql_query: `
          WITH positive_points AS (
            SELECT COALESCE(SUM(points), 0) AS total
            FROM points_transactions
            WHERE user_id = '${userId}' AND is_positive = true
          ),
          negative_points AS (
            SELECT COALESCE(SUM(points), 0) AS total
            FROM points_transactions
            WHERE user_id = '${userId}' AND is_positive = false
          ),
          transaction_count AS (
            SELECT COUNT(*) AS count
            FROM points_transactions
            WHERE user_id = '${userId}'
          )
          SELECT 
            (SELECT total FROM positive_points) AS positive_points,
            (SELECT total FROM negative_points) AS negative_points,
            (SELECT count FROM transaction_count) AS transaction_count,
            (SELECT total FROM positive_points) - (SELECT total FROM negative_points) AS total_points
        `
      })
      
      if (!directSqlError && directSqlResult && Array.isArray(directSqlResult) && directSqlResult.length > 0) {
        const positivePoints = parseInt(directSqlResult[0]?.positive_points || '0', 10)
        const negativePoints = parseInt(directSqlResult[0]?.negative_points || '0', 10)
        const transactionCount = parseInt(directSqlResult[0]?.transaction_count || '0', 10)
        const totalPoints = parseInt(directSqlResult[0]?.total_points || '0', 10)
        
        if (!isNaN(totalPoints)) {
          console.log(`[fix-points] Direct SQL calculation result: Positive=${positivePoints}, Negative=${negativePoints}, Total=${totalPoints}`)
          
          // Use direct SQL to update student_points for maximum reliability
          await adminClient.rpc('execute_raw_sql', {
            sql_query: `
              INSERT INTO student_points (student_id, points) 
              VALUES ('${userId}', ${totalPoints})
              ON CONFLICT (student_id) 
              DO UPDATE SET points = ${totalPoints}
            `
          })
          
          console.log(`[fix-points] Updated student_points with direct SQL: ${totalPoints} points`)
          
          return NextResponse.json({
            userId,
            method: 'direct-sql',
            positivePoints,
            negativePoints,
            totalPoints,
            transactionCount,
            success: true
          })
        }
      }
    } catch (sqlErr) {
      console.error("[fix-points] Direct SQL execution error:", sqlErr)
    }
    
    // Method 2: Try the RPC function if direct SQL failed
    try {
      console.log(`[fix-points] Attempting to calculate points via RPC for ${userId}`)
      const { data: rpcPoints, error: rpcError } = await adminClient.rpc('get_user_points_balance', {
        user_id_param: userId
      })
      
      if (!rpcError && rpcPoints !== null) {
        console.log(`[fix-points] Successfully calculated points via RPC: ${rpcPoints}`)
        
        // Update student_points table with the calculated balance
        await updateStudentPointsTable(adminClient, userId, rpcPoints)
        
        return NextResponse.json({
          userId,
          method: 'rpc',
          totalPoints: rpcPoints,
          success: true
        })
      } else {
        console.error(`[fix-points] RPC calculation failed:`, rpcError)
      }
    } catch (rpcErr) {
      console.error(`[fix-points] RPC error:`, rpcErr)
    }
    
    // Method 3: Fall back to manual calculation
    console.log(`[fix-points] Falling back to manual calculation`)
    
    // Get all points transactions for this user
    const { data: transactions, error: txError } = await adminClient
      .from('points_transactions')
      .select('points, is_positive')
      .eq('user_id', userId)
    
    if (txError) {
      console.error('[fix-points] Error fetching transactions:', txError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Calculate points
    const positivePoints = transactions
      ?.filter(tx => tx.is_positive === true)
      .reduce((sum, tx) => sum + tx.points, 0) || 0
    
    const negativePoints = transactions
      ?.filter(tx => tx.is_positive === false)
      .reduce((sum, tx) => sum + tx.points, 0) || 0
    
    const totalPoints = positivePoints - negativePoints

    console.log(`[fix-points] Manual calculation: Positive=${positivePoints}, Negative=${negativePoints}, Total=${totalPoints}`)

    // Update student_points table with the calculated balance
    await updateStudentPointsTable(adminClient, userId, totalPoints)

    return NextResponse.json({
      userId,
      method: 'manual',
      positivePoints,
      negativePoints,
      totalPoints,
      transactionCount: transactions?.length || 0,
      success: true
    })
  } catch (error) {
    console.error('[fix-points] Points recalculation error:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate points' },
      { status: 500 }
    )
  }
}

// Helper function to update student_points table
async function updateStudentPointsTable(adminClient: any, userId: string, points: number) {
  try {
    console.log(`[fix-points] Updating student_points table for user ${userId} with ${points} points`)
    
    // Check if student_points record exists
    const { count, error: countError } = await adminClient
      .from("student_points")
      .select("*", { count: "exact", head: true })
      .eq("student_id", userId)
    
    if (countError) {
      console.error("[fix-points] Error checking for student_points record:", countError)
      return false
    }
    
    if (count && count > 0) {
      // Update existing record
      const { error: updateError } = await adminClient
        .from("student_points")
        .update({ points: points })
        .eq("student_id", userId)
      
      if (updateError) {
        console.error("[fix-points] Error updating student_points:", updateError)
        return false
      }
      
      console.log(`[fix-points] Updated existing student_points record: ${points} points`)
    } else {
      // Insert new record
      const { error: insertError } = await adminClient
        .from("student_points")
        .insert({ student_id: userId, points: points })
      
      if (insertError) {
        console.error("[fix-points] Error inserting student_points:", insertError)
        return false
      }
      
      console.log(`[fix-points] Created new student_points record: ${points} points`)
    }
    
    return true
  } catch (error) {
    console.error("[fix-points] Error in updateStudentPointsTable:", error)
    return false
  }
}

async function getPointsFromStudentPointsTable(adminClient: any, userId: string): Promise<number | null> {
  try {
    console.log(`[fix-points] Checking student_points table for user ${userId}`)
    const { data, error } = await adminClient
      .from("student_points")
      .select("points")
      .eq("student_id", userId)
      .single()
    
    if (error) {
      console.error(`[fix-points] Error getting points from student_points:`, error)
      return null
    }
    
    if (data && typeof data.points === 'number') {
      console.log(`[fix-points] Found points in student_points: ${data.points}`)
      return data.points
    }
    
    console.log(`[fix-points] No valid points found in student_points`)
    return null
  } catch (err) {
    console.error(`[fix-points] Exception checking student_points:`, err)
    return null
  }
} 
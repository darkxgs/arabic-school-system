"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Return a static version for build time
  if (!isClient) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>البيانات جاري تحميلها...</CardTitle>
            </CardHeader>
            <CardContent>
              <p>جاري تحميل البيانات، يرجى الانتظار...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات الطلاب</CardTitle>
        </CardHeader>
        <CardContent>
          <p>إجمالي الطلاب: --</p>
          <p>الطلاب النشطون: --</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>النقاط والمكافآت</CardTitle>
        </CardHeader>
        <CardContent>
          <p>إجمالي النقاط الممنوحة: --</p>
          <p>المكافآت المستبدلة: --</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>آخر التحديثات</CardTitle>
        </CardHeader>
        <CardContent>
          <p>تم تحديث النظام بنجاح</p>
        </CardContent>
      </Card>
    </div>
  )
}

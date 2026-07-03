"use client"

import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestRLSPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const testRLS = async () => {
    setIsLoading(true)
    setTestResult("Testing RLS policies...")

    try {
      const supabase = createClient()

      // Test 1: Check if we can read from profiles table
      setTestResult(prev => prev + "\n\n1. Testing table access...")
      const { data: readData, error: readError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (readError) {
        setTestResult(prev => prev + `\n❌ Read failed: ${readError.message}`)
      } else {
        setTestResult(prev => prev + `\n✅ Read successful: ${readData?.length || 0} rows`)
      }

      // Test 2: Check table structure
      setTestResult(prev => prev + "\n\n2. Testing table structure...")
      const { data: structureData, error: structureError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, organization, role, created_at')
        .limit(0)
      
      if (structureError) {
        setTestResult(prev => prev + `\n❌ Structure check failed: ${structureError.message}`)
      } else {
        setTestResult(prev => prev + "\n✅ Table structure is correct")
      }

      // Test 3: Check RLS policies
      setTestResult(prev => prev + "\n\n3. Checking RLS policies...")
      let policiesData: unknown = null
      let policiesError: { message: string } | null = null
      try {
        const policiesResult = await supabase.rpc('get_policies', { table_name: 'profiles' })
        policiesData = policiesResult.data
        policiesError = policiesResult.error
      } catch {
        policiesError = { message: 'RPC function not available' }
      }

      if (policiesError) {
        setTestResult(prev => prev + `\n⚠️ Could not check policies directly: ${policiesError.message}`)
        setTestResult(prev => prev + "\n   (This is normal - checking manually)")
      } else {
        const policyCount = Array.isArray(policiesData) ? policiesData.length : 0
        setTestResult(prev => prev + `\n✅ Policies check: ${policyCount} policies found`)
      }

      // Test 4: Try to insert a test record (this should fail due to RLS)
      setTestResult(prev => prev + "\n\n4. Testing insert permissions...")
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          first_name: 'Test',
          last_name: 'User',
          role: 'fisherfolk'
        })
        .select()

      if (insertError) {
        if (insertError.message.includes('new row violates row-level security policy')) {
          setTestResult(prev => prev + "\n✅ RLS is working - insert blocked as expected")
        } else {
          setTestResult(prev => prev + `\n❌ Insert failed with unexpected error: ${insertError.message}`)
        }
      } else {
        setTestResult(prev => prev + "\n⚠️ Insert succeeded - RLS might not be working properly")
      }

      setTestResult(prev => prev + "\n\n✅ RLS test completed!")

    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkPoliciesManually = () => {
    setTestResult(prev => prev + "\n\n📋 Manual RLS Policy Check:")
    setTestResult(prev => prev + "\nGo to your Supabase dashboard:")
    setTestResult(prev => prev + "\n1. Authentication → Policies")
    setTestResult(prev => prev + "\n2. Look for 'profiles' table")
    setTestResult(prev => prev + "\n3. You should see 4 policies:")
    setTestResult(prev => prev + "\n   - profiles_select_own")
    setTestResult(prev => prev + "\n   - profiles_insert_own")
    setTestResult(prev => prev + "\n   - profiles_update_own")
    setTestResult(prev => prev + "\n   - profiles_delete_own")
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>RLS Policy Test</CardTitle>
          <CardDescription>
            Test if your Row Level Security policies are working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testRLS} 
              disabled={isLoading}
            >
              {isLoading ? "Testing..." : "Test RLS Policies"}
            </Button>
            <Button 
              onClick={checkPoliciesManually} 
              variant="outline"
            >
              Check Policies Manually
            </Button>
          </div>
          
          {testResult && (
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <h3 className="font-semibold mb-2">What This Test Does:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Tests if the profiles table is accessible</li>
              <li>Verifies the table structure is correct</li>
              <li>Checks if RLS policies are working</li>
              <li>Tests insert permissions (should be blocked without auth)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

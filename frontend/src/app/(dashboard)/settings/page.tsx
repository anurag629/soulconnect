'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogOut, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/Modal'
import { useAuthStore } from '@/lib/store'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const passwordSchema = z.object({
  old_password: z.string().min(1, 'Required'),
  new_password: z.string().min(8, 'Min 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    try {
      await authAPI.changePassword({ old_password: data.old_password, new_password: data.new_password })
      toast.success('Password changed')
      reset()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Account Info */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Phone</span>
            <span className="text-gray-900">{user?.phone_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="text-green-600">Active</span>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3">
            <Input
              type="password"
              label="Current Password"
              error={errors.old_password?.message}
              {...register('old_password')}
            />
            <Input
              type="password"
              label="New Password"
              error={errors.new_password?.message}
              {...register('new_password')}
            />
            <Input
              type="password"
              label="Confirm Password"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />
            <Button type="submit" size="sm" isLoading={isChangingPassword}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Show Profile', desc: 'Visible to other members', checked: true },
            { label: 'Show Photos', desc: 'Photos visible to others', checked: true },
            { label: 'Show Contact', desc: 'Contact visible to premium', checked: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={item.checked}
                className="h-4 w-4 text-primary-600 rounded"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setShowLogoutModal(true)}
          leftIcon={<LogOut className="h-4 w-4" />}
        >
          Sign Out
        </Button>
        <Button
          variant="danger"
          className="w-full justify-start"
          onClick={() => setShowDeleteModal(true)}
          leftIcon={<Trash2 className="h-4 w-4" />}
        >
          Delete Account
        </Button>
      </div>

      <ConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        onConfirm={handleLogout}
      />

      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Account"
        description="This cannot be undone. All your data will be deleted."
        confirmText="Delete"
        variant="danger"
        onConfirm={() => {
          toast.error('Not implemented')
          setShowDeleteModal(false)
        }}
      />
    </div>
  )
}

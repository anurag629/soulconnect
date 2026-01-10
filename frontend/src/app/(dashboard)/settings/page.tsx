/**
 * Settings Page
 * User account and privacy settings
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  Trash2,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import {
  Tabs,
  TabsList,
  TabsTriggerUnderlined,
  TabsContent,
  TabsListUnderlined,
} from '@/components/ui/Tabs'
import { useAuthStore } from '@/lib/store'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

// Change password schema
const passwordSchema = z
  .object({
    old_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Password form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    try {
      await authAPI.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully')
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

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    toast.error('Account deletion is not yet implemented')
    setShowDeleteModal(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="account">
        <TabsListUnderlined className="mb-8">
          <TabsTriggerUnderlined value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTriggerUnderlined>
          <TabsTriggerUnderlined value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTriggerUnderlined>
          <TabsTriggerUnderlined value="privacy">
            <Shield className="h-4 w-4 mr-2" />
            Privacy
          </TabsTriggerUnderlined>
          <TabsTriggerUnderlined value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTriggerUnderlined>
        </TabsListUnderlined>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{user?.phone_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <p className="text-gray-900">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                          })
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Status</label>
                    <p className="text-green-600 font-medium">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Sign Out</h3>
                    <p className="text-sm text-gray-500">
                      Sign out from your account on this device
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutModal(true)}
                    leftIcon={<LogOut className="h-4 w-4" />}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-red-600">Delete Account</h3>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(onPasswordSubmit)}
                  className="space-y-4 max-w-md"
                >
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
                    hint="At least 8 characters with uppercase, lowercase, and number"
                    {...register('new_password')}
                  />
                  <Input
                    type="password"
                    label="Confirm New Password"
                    error={errors.confirm_password?.message}
                    {...register('confirm_password')}
                  />
                  <Button
                    type="submit"
                    isLoading={isChangingPassword}
                  >
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.is_email_verified ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {user?.is_email_verified ? '✓' : '!'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email Verification</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <span className={user?.is_email_verified ? 'text-green-600' : 'text-yellow-600'}>
                    {user?.is_email_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.is_phone_verified ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {user?.is_phone_verified ? '✓' : '!'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone Verification</p>
                      <p className="text-sm text-gray-500">{user?.phone_number}</p>
                    </div>
                  </div>
                  <span className={user?.is_phone_verified ? 'text-green-600' : 'text-yellow-600'}>
                    {user?.is_phone_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user?.is_id_verified ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {user?.is_id_verified ? '✓' : '!'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">ID Verification</p>
                      <p className="text-sm text-gray-500">Government ID</p>
                    </div>
                  </div>
                  <span className={user?.is_id_verified ? 'text-green-600' : 'text-yellow-600'}>
                    {user?.is_id_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Show Profile</p>
                    <p className="text-sm text-gray-500">Make your profile visible to other members</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Show Photos</p>
                    <p className="text-sm text-gray-500">Show your photos to other members</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Show Contact Info</p>
                    <p className="text-sm text-gray-500">Show your contact details to premium members</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'New matches', desc: 'Get notified when you have a new match' },
                  { label: 'New messages', desc: 'Get notified when you receive a message' },
                  { label: 'Profile views', desc: 'Get notified when someone views your profile' },
                  { label: 'Interest requests', desc: 'Get notified when someone expresses interest' },
                  { label: 'Promotional emails', desc: 'Receive offers and updates from SoulConnect' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={index < 4} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Logout Modal */}
      <ConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Sign Out"
        description="Are you sure you want to sign out from your account?"
        confirmText="Sign Out"
        onConfirm={handleLogout}
      />

      {/* Delete Account Modal */}
      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Account"
        description="This action cannot be undone. All your data, matches, and messages will be permanently deleted."
        confirmText="Delete Account"
        variant="danger"
        onConfirm={handleDeleteAccount}
      />
    </div>
  )
}

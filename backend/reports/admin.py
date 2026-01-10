"""
Admin configuration for reports app.
"""

from django.contrib import admin
from django.utils import timezone
from .models import Report, Feedback


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = [
        'reporter', 'reported_profile', 'report_type',
        'status', 'action_taken', 'created_at', 'resolved_at'
    ]
    list_filter = ['report_type', 'status', 'action_taken', 'created_at']
    search_fields = [
        'reporter__full_name', 'reported_profile__full_name', 'description'
    ]
    readonly_fields = ['reporter', 'reported_profile', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Report Details', {
            'fields': ('reporter', 'reported_profile', 'report_type', 'description', 'screenshot')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Resolution', {
            'fields': ('action_taken', 'resolution_notes', 'resolved_by', 'resolved_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_under_review', 'dismiss_reports', 'ban_reported_users']
    
    @admin.action(description='Mark selected reports as Under Review')
    def mark_under_review(self, request, queryset):
        queryset.update(status='under_review')
    
    @admin.action(description='Dismiss selected reports')
    def dismiss_reports(self, request, queryset):
        queryset.update(
            status='dismissed',
            resolved_by=request.user,
            resolved_at=timezone.now()
        )
    
    @admin.action(description='Ban reported users and resolve reports')
    def ban_reported_users(self, request, queryset):
        for report in queryset:
            user = report.reported_profile.user
            user.is_banned = True
            user.ban_reason = f"Banned due to report: {report.report_type}"
            user.save()
            
            report.status = 'resolved'
            report.action_taken = 'account_banned'
            report.resolved_by = request.user
            report.resolved_at = timezone.now()
            report.save()


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'feedback_type', 'subject',
        'is_read', 'created_at', 'responded_at'
    ]
    list_filter = ['feedback_type', 'is_read', 'created_at']
    search_fields = ['user__email', 'subject', 'message']
    readonly_fields = ['user', 'feedback_type', 'subject', 'message', 'created_at']
    
    fieldsets = (
        ('Feedback', {
            'fields': ('user', 'feedback_type', 'subject', 'message', 'screenshot')
        }),
        ('Response', {
            'fields': ('is_read', 'response', 'responded_by', 'responded_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

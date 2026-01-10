"""
Admin configuration for chat app.
"""

from django.contrib import admin
from .models import Conversation, Message, ChatRequest


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = [
        'participant1', 'participant2', 'is_active',
        'last_message_at', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = [
        'participant1__full_name', 'participant2__full_name'
    ]
    readonly_fields = ['match', 'created_at', 'updated_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = [
        'sender', 'conversation', 'message_type',
        'content_preview', 'is_read', 'created_at'
    ]
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['sender__full_name', 'content']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(ChatRequest)
class ChatRequestAdmin(admin.ModelAdmin):
    list_display = [
        'from_profile', 'to_profile', 'status',
        'created_at', 'responded_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['from_profile__full_name', 'to_profile__full_name']

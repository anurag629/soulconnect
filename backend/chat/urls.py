"""
URL configuration for chat app.
"""

from django.urls import path
from .views import (
    ConversationListView, ConversationDetailView, GetOrCreateConversationView,
    SendMessageView, MessageListView, MarkAsReadView,
    SendChatRequestView, ChatRequestListView, RespondChatRequestView,
    UnreadCountView
)

app_name = 'chat'

urlpatterns = [
    # Conversations
    path('conversations/', ConversationListView.as_view(), name='conversation_list'),
    path('conversations/<uuid:id>/', ConversationDetailView.as_view(), name='conversation_detail'),
    path('conversations/match/<uuid:match_id>/', GetOrCreateConversationView.as_view(), name='get_or_create_conversation'),
    
    # Messages
    path('conversations/<uuid:conversation_id>/messages/', MessageListView.as_view(), name='message_list'),
    path('conversations/<uuid:conversation_id>/send/', SendMessageView.as_view(), name='send_message'),
    path('conversations/<uuid:conversation_id>/read/', MarkAsReadView.as_view(), name='mark_as_read'),
    
    # Chat Requests
    path('requests/', ChatRequestListView.as_view(), name='chat_request_list'),
    path('requests/send/', SendChatRequestView.as_view(), name='send_chat_request'),
    path('requests/<uuid:request_id>/respond/', RespondChatRequestView.as_view(), name='respond_chat_request'),
    
    # Unread count
    path('unread/', UnreadCountView.as_view(), name='unread_count'),
]

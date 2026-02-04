import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, Send, Inbox, CheckCircle, Clock, User,
  Reply, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import { toast } from 'sonner';
import { mockUsers } from '@/data/mockData';

export default function DoctorMessages() {
  const { messages, addMessage, markMessageRead } = useData();
  const { user } = useAuth();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({ recipientId: '', subject: '', message: '' });

  // Only school admin can send messages; doctors and parents can only view inbox/sent
  const canSendMessages = user?.role === 'school_admin';

  const inboxMessages = messages.filter(m => m.recipientId === user?.id);
  const sentMessages = messages.filter(m => m.senderId === user?.id);

  const handleSend = () => {
    if (!user || !newMessage.recipientId || !newMessage.message) return;

    const msg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      recipientId: newMessage.recipientId,
      subject: newMessage.subject,
      message: newMessage.message,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    addMessage(msg);
    toast.success('Message sent successfully!');
    setNewMessage({ recipientId: '', subject: '', message: '' });
    setShowCompose(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Messages
          </h1>
          <p className="text-muted-foreground">
            {canSendMessages
              ? 'Communicate with parents and staff'
              : 'Only school admin can send messages. View your inbox below.'}
          </p>
        </div>
        {canSendMessages && (
          <Button onClick={() => setShowCompose(true)}>
            <Send className="h-4 w-4 mr-2" />
            Compose
          </Button>
        )}
      </div>

      {canSendMessages && showCompose ? (
        <Card>
          <CardHeader>
            <CardTitle>New Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">To</label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={newMessage.recipientId}
                onChange={(e) => setNewMessage(prev => ({ ...prev, recipientId: e.target.value }))}
              >
                <option value="">Select recipient...</option>
                {mockUsers.filter(u => u.id !== user?.id).map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Type your message..."
                rows={5}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Inbox ({inboxMessages.filter(m => !m.isRead).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {inboxMessages.map(msg => {
                  const sender = mockUsers.find(u => u.id === msg.senderId);
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-muted transition-colors",
                        !msg.isRead && "bg-primary/5 border-l-2 border-primary",
                        selectedMessage?.id === msg.id && "bg-muted"
                      )}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (!msg.isRead) markMessageRead(msg.id);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{sender?.fullName}</span>
                      </div>
                      <p className="font-medium truncate">{msg.subject || '(No subject)'}</p>
                      <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
                {inboxMessages.length === 0 && (
                  <p className="p-4 text-center text-muted-foreground">No messages</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Detail */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              {selectedMessage ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedMessage.subject || '(No subject)'}</h3>
                      <p className="text-sm text-muted-foreground">
                        From: {mockUsers.find(u => u.id === selectedMessage.senderId)?.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {canSendMessages && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a message to read</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

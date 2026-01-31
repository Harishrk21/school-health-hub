import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Mail, Send, Inbox, MessageSquare, Bell, Users,
  FileText, Search, User, Clock, CheckCircle, Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { mockUsers } from '@/data/mockData';

interface Announcement {
  id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'class' | 'individual';
  targetClasses?: string[];
  targetStudents?: string[];
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  sentAt?: string;
}

export default function CommunicationHub() {
  const navigate = useNavigate();
  const { messages, students, addMessage, markMessageRead } = useData();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('messages');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    recipientType: 'individual' as 'individual' | 'class' | 'all',
    selectedClass: '',
    subject: '',
    message: '',
    useTemplate: false,
    template: '',
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetAudience: 'all' as 'all' | 'class' | 'individual',
    targetClasses: [] as string[],
    scheduledFor: '',
  });

  const messageTemplates = [
    {
      name: 'Vaccination Reminder',
      subject: 'Vaccination Due - Action Required',
      message: 'Dear Parent,\n\nYour child {student_name} has a vaccination due on {date}. Please ensure they are available for the vaccination.\n\nThank you,\nSchool Health Center',
    },
    {
      name: 'Checkup Reminder',
      subject: 'Health Checkup Scheduled',
      message: 'Dear Parent,\n\nA health checkup has been scheduled for {student_name} on {date} at {time}. Please ensure your child attends.\n\nThank you,\nSchool Health Center',
    },
    {
      name: 'Emergency Alert',
      subject: 'URGENT: Medical Attention Required',
      message: 'Dear Parent,\n\nThis is an urgent notification regarding {student_name}. Please contact the school immediately.\n\nSchool Health Center',
    },
  ];

  const inboxMessages = messages.filter(m => m.recipientId === user?.id);
  const sentMessages = messages.filter(m => m.senderId === user?.id);
  const unreadCount = inboxMessages.filter(m => !m.isRead).length;

  const handleSendMessage = () => {
    if (!user || !newMessage.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (newMessage.recipientType === 'all') {
      // Send to all parents
      const parents = mockUsers.filter(u => u.role === 'parent');
      parents.forEach(parent => {
        const msg: Message = {
          id: `MSG-${Date.now()}-${Math.random()}`,
          senderId: user.id,
          recipientId: parent.id,
          subject: newMessage.subject || 'Announcement',
          message: newMessage.message,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        addMessage(msg);
      });
      toast.success(`Message sent to ${parents.length} recipients`);
    } else if (newMessage.recipientType === 'class') {
      // Send to parents of students in selected class
      const classStudents = students.filter(s => s.class === newMessage.selectedClass);
      const parentIds = new Set(classStudents.map(s => {
        // In real system, would get parent IDs from student relationships
        return 'parent-001'; // Mock
      }));
      parentIds.forEach(parentId => {
        const msg: Message = {
          id: `MSG-${Date.now()}-${Math.random()}`,
          senderId: user.id,
          recipientId: parentId,
          subject: newMessage.subject || 'Class Announcement',
          message: newMessage.message,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        addMessage(msg);
      });
      toast.success(`Message sent to parents of Class ${newMessage.selectedClass}`);
    } else {
      // Individual message
      if (!newMessage.recipientId) {
      toast.error('Please select a recipient');
        return;
      }
      const msg: Message = {
        id: `MSG-${Date.now()}`,
        senderId: user.id,
        recipientId: newMessage.recipientId,
        subject: newMessage.subject || 'Message',
        message: newMessage.message,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      addMessage(msg);
      toast.success('Message sent successfully');
    }

    setNewMessage({
      recipientId: '',
      recipientType: 'individual',
      selectedClass: '',
      subject: '',
      message: '',
      useTemplate: false,
      template: '',
    });
  };

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
    toast.error('Please fill in title and message');
      return;
    }

    const announcement: Announcement = {
      id: `ANN-${Date.now()}`,
      title: newAnnouncement.title,
      message: newAnnouncement.message,
      targetAudience: newAnnouncement.targetAudience,
      targetClasses: newAnnouncement.targetClasses,
      scheduledFor: newAnnouncement.scheduledFor || undefined,
      status: newAnnouncement.scheduledFor ? 'scheduled' : 'sent',
      createdAt: new Date().toISOString(),
      sentAt: newAnnouncement.scheduledFor ? undefined : new Date().toISOString(),
    };

    setAnnouncements([...announcements, announcement]);
    toast.success(newAnnouncement.scheduledFor 
      ? 'Announcement scheduled successfully' 
      : 'Announcement sent successfully');

    setNewAnnouncement({
      title: '',
      message: '',
      targetAudience: 'all',
      targetClasses: [],
      scheduledFor: '',
    });
  };

  const filteredMessages = React.useMemo(() => {
    const messagesToFilter = selectedTab === 'inbox' ? inboxMessages : sentMessages;
    if (!searchTerm) return messagesToFilter;
    
    return messagesToFilter.filter(msg => {
      const sender = mockUsers.find(u => u.id === msg.senderId);
      const recipient = mockUsers.find(u => u.id === msg.recipientId);
      return (
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sender?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipient?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [selectedTab, inboxMessages, sentMessages, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Communication Hub</h1>
        <p className="text-muted-foreground">Messages, announcements, and communication management</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {unreadCount} unread
              </Badge>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Compose Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Compose Message</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Send To</Label>
                    <Select
                      value={newMessage.recipientType}
                      onValueChange={(value) => setNewMessage({ ...newMessage, recipientType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="class">Entire Class</SelectItem>
                        <SelectItem value="all">All Parents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newMessage.recipientType === 'individual' && (
                    <div className="space-y-2">
                      <Label>Recipient</Label>
                      <Select
                        value={newMessage.recipientId}
                        onValueChange={(value) => setNewMessage({ ...newMessage, recipientId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockUsers.filter(u => u.id !== user?.id).map(u => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.fullName} ({u.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newMessage.recipientType === 'class' && (
                    <div className="space-y-2">
                      <Label>Select Class</Label>
                      <Select
                        value={newMessage.selectedClass}
                        onValueChange={(value) => setNewMessage({ ...newMessage, selectedClass: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                            <SelectItem key={c} value={c}>Class {c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Use Template</Label>
                    <Select
                      value={newMessage.template}
                      onValueChange={(value) => {
                        const template = messageTemplates.find(t => t.name === value);
                        if (template) {
                          setNewMessage({
                            ...newMessage,
                            subject: template.subject,
                            message: template.message,
                            template: value,
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {messageTemplates.map(t => (
                          <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                      placeholder="Message subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={newMessage.message}
                      onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                      placeholder="Type your message..."
                      rows={6}
                    />
                  </div>

                  <Button onClick={handleSendMessage} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedTab} onValueChange={setSelectedTab}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">Inbox</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedTab === 'inbox' ? <Inbox className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                  {selectedTab === 'inbox' ? 'Inbox' : 'Sent'} ({filteredMessages.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {filteredMessages.map(msg => {
                    const otherUser = selectedTab === 'inbox'
                      ? mockUsers.find(u => u.id === msg.senderId)
                      : mockUsers.find(u => u.id === msg.recipientId);
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "p-4 cursor-pointer hover:bg-muted transition-colors",
                          !msg.isRead && selectedTab === 'inbox' && "bg-primary/5 border-l-2 border-primary",
                          selectedMessage?.id === msg.id && "bg-muted"
                        )}
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (!msg.isRead && selectedTab === 'inbox') markMessageRead(msg.id);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{otherUser?.fullName || 'Unknown'}</span>
                          {!msg.isRead && selectedTab === 'inbox' && (
                            <Badge variant="default" className="ml-auto">New</Badge>
                          )}
                        </div>
                        <p className="font-medium truncate">{msg.subject || '(No subject)'}</p>
                        <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    );
                  })}
                  {filteredMessages.length === 0 && (
                    <p className="p-4 text-center text-muted-foreground">No messages</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                {selectedMessage ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedMessage.subject || '(No subject)'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedTab === 'inbox' ? 'From' : 'To'}: {
                            selectedTab === 'inbox'
                              ? mockUsers.find(u => u.id === selectedMessage.senderId)?.fullName
                              : mockUsers.find(u => u.id === selectedMessage.recipientId)?.fullName
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedMessage.createdAt), 'PPp')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {selectedTab === 'inbox' && (
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                        )}
                      </div>
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
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Bell className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    placeholder="Announcement title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select
                    value={newAnnouncement.targetAudience}
                    onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, targetAudience: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students/Parents</SelectItem>
                      <SelectItem value="class">Specific Classes</SelectItem>
                      <SelectItem value="individual">Individual Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newAnnouncement.targetAudience === 'class' && (
                  <div className="space-y-2">
                    <Label>Select Classes</Label>
                    <div className="grid grid-cols-4 gap-2 p-4 border rounded-lg">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(classNum => (
                        <div key={classNum} className="flex items-center space-x-2">
                          <Checkbox
                            id={`announce-class-${classNum}`}
                            checked={newAnnouncement.targetClasses.includes(classNum)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewAnnouncement({
                                  ...newAnnouncement,
                                  targetClasses: [...newAnnouncement.targetClasses, classNum],
                                });
                              } else {
                                setNewAnnouncement({
                                  ...newAnnouncement,
                                  targetClasses: newAnnouncement.targetClasses.filter(c => c !== classNum),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={`announce-class-${classNum}`} className="text-sm font-normal cursor-pointer">
                            Class {classNum}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Message *</Label>
                  <Textarea
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                    placeholder="Announcement message..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Schedule (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={newAnnouncement.scheduledFor}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, scheduledFor: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to send immediately
                  </p>
                </div>

                <Button onClick={handleCreateAnnouncement} className="w-full">
                  {newAnnouncement.scheduledFor ? 'Schedule Announcement' : 'Send Announcement'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {announcements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map(announcement => (
                      <TableRow key={announcement.id}>
                        <TableCell className="font-medium">{announcement.title}</TableCell>
                        <TableCell>
                          {announcement.targetAudience === 'all' ? 'All' :
                           announcement.targetAudience === 'class' 
                             ? `Classes: ${announcement.targetClasses?.join(', ')}`
                             : 'Individual'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            announcement.status === 'sent' ? 'default' :
                            announcement.status === 'scheduled' ? 'secondary' : 'outline'
                          }>
                            {announcement.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {announcement.sentAt 
                            ? format(new Date(announcement.sentAt), 'PPp')
                            : announcement.scheduledFor
                            ? format(new Date(announcement.scheduledFor), 'PPp')
                            : format(new Date(announcement.createdAt), 'PPp')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No announcements yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Pre-built message templates for common scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {messageTemplates.map(template => (
                  <Card key={template.name}>
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Subject:</p>
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Message:</p>
                        <p className="text-sm text-muted-foreground line-clamp-3">{template.message}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setNewMessage({
                            ...newMessage,
                            subject: template.subject,
                            message: template.message,
                            template: template.name,
                          });
                          setSelectedTab('messages');
                        }}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


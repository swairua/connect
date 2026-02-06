import { useState } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  Mail,
  Send,
  Eye,
  Copy,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

const categories = ["Onboarding", "Billing", "Account", "Service", "Support"];
const variablesList = [
  "customer_name",
  "package_name",
  "amount",
  "due_date",
  "invoice_id",
  "expiry_date",
  "speed",
  "ticket_id",
  "subject",
  "priority",
  "resolution",
  "date",
  "start_time",
  "end_time",
];

const defaultTemplates = [
  {
    id: "TPL001",
    name: "Welcome Message",
    type: "SMS" as const,
    category: "Onboarding" as const,
    subject: "",
    content: "Welcome to NetFlow ISP, {{customer_name}}! Your account has been activated. Package: {{package_name}}. Support: +254 700 123 456",
    enabled: true,
    variables: ["customer_name", "package_name"],
  },
  {
    id: "TPL002",
    name: "Payment Reminder (5 Days)",
    type: "SMS" as const,
    category: "Billing" as const,
    subject: "",
    content: "Hi {{customer_name}}, your invoice of KES {{amount}} is due in 5 days ({{due_date}}). Pay via M-Pesa Paybill 123456. Ref: {{invoice_id}}",
    enabled: true,
    variables: ["customer_name", "amount", "due_date", "invoice_id"],
  },
];

const NotificationTemplatesPage = () => {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<typeof notificationTemplates[0] | null>(null);
  const [selectedType, setSelectedType] = useState<"SMS" | "Email">("SMS");
  const { toast } = useToast();

  const smsTemplates = templates.filter((t) => t.type === "SMS");
  const emailTemplates = templates.filter((t) => t.type === "Email");

  const handleSave = () => {
    toast({
      title: editingTemplate ? "Template Updated" : "Template Created",
      description: "Notification template has been saved successfully.",
    });
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleDelete = (templateId: string) => {
    setTemplates(templates.filter((t) => t.id !== templateId));
    toast({
      title: "Template Deleted",
      description: "Notification template has been removed.",
      variant: "destructive",
    });
  };

  const handleToggle = (templateId: string) => {
    setTemplates(
      templates.map((t) =>
        t.id === templateId ? { ...t, enabled: !t.enabled } : t
      )
    );
    toast({
      title: "Template Updated",
      description: "Template status has been changed.",
    });
  };

  const handleTestSend = () => {
    toast({
      title: "Test Sent",
      description: "Test notification has been sent successfully.",
    });
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    toast({
      title: "Copied",
      description: `{{${variable}}} copied to clipboard`,
    });
  };

  const TemplateCard = ({ template }: { template: typeof notificationTemplates[0] }) => (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">{template.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{template.category}</Badge>
              {template.enabled ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="outline">Disabled</Badge>
              )}
            </div>
          </div>
          <Switch
            checked={template.enabled}
            onCheckedChange={() => handleToggle(template.id)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {template.subject && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Subject</p>
            <p className="text-sm font-medium">{template.subject}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Content</p>
          <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
            {template.content}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Variables</p>
          <div className="flex flex-wrap gap-1">
            {template.variables.map((v) => (
              <Badge key={v} variant="outline" className="text-xs font-mono">
                {`{{${v}}}`}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingTemplate(template);
              setSelectedType(template.type);
              setDialogOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingTemplate(template);
              setPreviewOpen(true);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button variant="ghost" size="sm" onClick={handleTestSend}>
            <Send className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive ml-auto"
            onClick={() => handleDelete(template.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarLayout>
      <PageHeader
        title="Notification Templates"
        description="Manage SMS and Email notification templates for automated customer communication."
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SMS Templates</p>
                <p className="text-2xl font-bold">{smsTemplates.length}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <MessageSquare className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Email Templates</p>
                <p className="text-2xl font-bold">{emailTemplates.length}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <Mail className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold text-success">
                  {templates.filter((t) => t.enabled).length}
                </p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <Copy className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sms" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="sms" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS Templates
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Templates
            </TabsTrigger>
          </TabsList>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="accent" onClick={() => setEditingTemplate(null)}>
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Create Template"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      placeholder="e.g., Payment Reminder"
                      defaultValue={editingTemplate?.name || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      defaultValue={editingTemplate?.type || selectedType}
                      onValueChange={(v) => setSelectedType(v as "SMS" | "Email")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select defaultValue={editingTemplate?.category || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(selectedType === "Email" || editingTemplate?.type === "Email") && (
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      placeholder="e.g., Invoice {{invoice_id}} - Payment Due"
                      defaultValue={editingTemplate?.subject || ""}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea
                    placeholder="Enter your message content..."
                    rows={6}
                    defaultValue={editingTemplate?.content || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Available Variables (click to copy)
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {variablesList.map((v) => (
                      <Badge
                        key={v}
                        variant="outline"
                        className="text-xs font-mono cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        onClick={() => copyVariable(v)}
                      >
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="accent" className="flex-1" onClick={handleSave}>
                    {editingTemplate ? "Update Template" : "Create Template"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="sms">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {smsTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email">
          <div className="grid gap-4 md:grid-cols-2">
            {emailTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                {editingTemplate.type === "SMS" ? (
                  <MessageSquare className="h-5 w-5 text-accent" />
                ) : (
                  <Mail className="h-5 w-5 text-accent" />
                )}
                <span className="font-medium">{editingTemplate.name}</span>
              </div>
              {editingTemplate.subject && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Subject</p>
                  <p className="font-medium">
                    {editingTemplate.subject
                      .replace("{{customer_name}}", "John Kamau")
                      .replace("{{invoice_id}}", "INV-2024-001")
                      .replace("{{amount}}", "5,000")
                      .replace("{{due_date}}", "Dec 15, 2024")}
                  </p>
                </div>
              )}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Message</p>
                <p className="whitespace-pre-wrap">
                  {editingTemplate.content
                    .replace(/\{\{customer_name\}\}/g, "John Kamau")
                    .replace(/\{\{package_name\}\}/g, "Premium 50Mbps")
                    .replace(/\{\{amount\}\}/g, "5,000")
                    .replace(/\{\{due_date\}\}/g, "Dec 15, 2024")
                    .replace(/\{\{invoice_id\}\}/g, "INV-2024-001")
                    .replace(/\{\{expiry_date\}\}/g, "Jan 15, 2025")
                    .replace(/\{\{speed\}\}/g, "50 Mbps")
                    .replace(/\{\{ticket_id\}\}/g, "TKT-001")
                    .replace(/\{\{subject\}\}/g, "Slow internet speed")
                    .replace(/\{\{priority\}\}/g, "High")
                    .replace(/\{\{resolution\}\}/g, "Router configuration updated")
                    .replace(/\{\{date\}\}/g, "Dec 10, 2024")
                    .replace(/\{\{start_time\}\}/g, "02:00 AM")
                    .replace(/\{\{end_time\}\}/g, "04:00 AM")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPreviewOpen(false)}
                >
                  Close
                </Button>
                <Button variant="accent" className="flex-1" onClick={handleTestSend}>
                  <Send className="h-4 w-4" />
                  Send Test
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default NotificationTemplatesPage;

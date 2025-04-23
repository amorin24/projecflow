import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, Check, Copy, ExternalLink, RefreshCw, Settings } from 'lucide-react';

const integrations = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect your GitHub repositories to sync issues and pull requests.',
    icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    connected: true,
    category: 'version-control',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications and updates in your Slack channels.',
    icon: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
    connected: true,
    category: 'communication',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync tasks with Jira issues and track progress across platforms.',
    icon: 'https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon-32x32.png',
    connected: false,
    category: 'project-management',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync project deadlines and meetings with your Google Calendar.',
    icon: 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png',
    connected: true,
    category: 'calendar',
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Link design files directly to your projects and tasks.',
    icon: 'https://static.figma.com/app/icon/1/favicon.png',
    connected: false,
    category: 'design',
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'Connect to AWS services for deployment and infrastructure management.',
    icon: 'https://a0.awsstatic.com/libra-css/images/site/fav/favicon.ico',
    connected: false,
    category: 'cloud',
  },
];

const IntegrationCard = ({ integration, onToggle, onConfigure }: { 
  integration: typeof integrations[0]; 
  onToggle: (id: string, enabled: boolean) => void;
  onConfigure: (id: string) => void;
}) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <img 
            src={integration.icon} 
            alt={`${integration.name} logo`} 
            className="w-8 h-8 rounded"
          />
          <div>
            <CardTitle className="text-lg">{integration.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="min-h-[60px]">{integration.description}</CardDescription>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id={`${integration.id}-switch`}
              checked={integration.connected}
              onCheckedChange={(checked) => onToggle(integration.id, checked)}
            />
            <Label htmlFor={`${integration.id}-switch`}>
              {integration.connected ? 'Connected' : 'Disconnected'}
            </Label>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onConfigure(integration.id)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState([
    { id: 'api-key-1', name: 'Production API Key', key: 'pk_live_xxxxxxxxxxxxxxxxxxxx', created: '2023-01-15' },
    { id: 'api-key-2', name: 'Development API Key', key: 'pk_test_xxxxxxxxxxxxxxxxxxxx', created: '2023-02-20' },
  ]);
  
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const handleCopyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };
  
  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    
    const newKey = {
      id: `api-key-${Date.now()}`,
      name: newKeyName,
      key: `pk_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>Manage API keys for external integrations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiKeys.map(apiKey => (
            <div 
              key={apiKey.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div>
                <div className="font-medium">{apiKey.name}</div>
                <div className="text-sm text-muted-foreground">Created: {apiKey.created}</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {apiKey.key.substring(0, 8)}...
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                >
                  {copiedId === apiKey.id ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-2">
          <Label htmlFor="new-key-name">Create New API Key</Label>
          <div className="flex space-x-2">
            <Input 
              id="new-key-name"
              placeholder="API Key Name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <Button onClick={handleCreateKey}>Generate</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WebhookConfiguration = () => {
  const [webhooks, setWebhooks] = useState([
    { id: 'webhook-1', name: 'Task Updates', url: 'https://example.com/webhooks/tasks', events: ['task.created', 'task.updated'], active: true },
    { id: 'webhook-2', name: 'Project Updates', url: 'https://example.com/webhooks/projects', events: ['project.created', 'project.updated'], active: false },
  ]);
  
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [] as string[],
  });
  
  const handleToggleWebhook = (id: string, active: boolean) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === id ? { ...webhook, active } : webhook
    ));
  };
  
  const handleAddWebhook = () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0) return;
    
    const webhook = {
      id: `webhook-${Date.now()}`,
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      active: true,
    };
    
    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhooks</CardTitle>
        <CardDescription>Configure webhooks to notify external services about events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {webhooks.map(webhook => (
            <div 
              key={webhook.id}
              className="p-4 border rounded-md"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{webhook.name}</div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id={`${webhook.id}-switch`}
                    checked={webhook.active}
                    onCheckedChange={(checked) => handleToggleWebhook(webhook.id, checked)}
                  />
                  <Label htmlFor={`${webhook.id}-switch`}>
                    {webhook.active ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
              
              <div className="mt-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <span className="font-mono break-all">{webhook.url}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-2"
                    onClick={() => window.open(webhook.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {webhook.events.map(event => (
                  <span 
                    key={event}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="webhook-name">Webhook Name</Label>
            <Input 
              id="webhook-name"
              className="mt-1"
              placeholder="e.g., Slack Notifications"
              value={newWebhook.name}
              onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input 
              id="webhook-url"
              className="mt-1"
              placeholder="https://example.com/webhook"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
            />
          </div>
          
          <div>
            <Label>Events</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {['task.created', 'task.updated', 'task.deleted', 'project.created', 'project.updated', 'project.deleted'].map(event => (
                <div key={event} className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id={`event-${event}`}
                    checked={newWebhook.events.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
                      } else {
                        setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
                      }
                    }}
                  />
                  <Label htmlFor={`event-${event}`} className="text-sm">
                    {event}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={handleAddWebhook} className="w-full">Add Webhook</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const OAuthConfiguration = () => {
  const [oauthConfig, setOauthConfig] = useState({
    clientId: 'your-client-id',
    clientSecret: '••••••••••••••••',
    redirectUri: 'https://your-app.com/oauth/callback',
    scopes: 'read,write,profile',
  });
  
  const handleChange = (field: keyof typeof oauthConfig, value: string) => {
    setOauthConfig({ ...oauthConfig, [field]: value });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>OAuth Configuration</CardTitle>
        <CardDescription>Configure OAuth settings for third-party authentication</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="client-id">Client ID</Label>
            <Input 
              id="client-id"
              className="mt-1"
              value={oauthConfig.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="client-secret">Client Secret</Label>
            <Input 
              id="client-secret"
              className="mt-1"
              type="password"
              value={oauthConfig.clientSecret}
              onChange={(e) => handleChange('clientSecret', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="redirect-uri">Redirect URI</Label>
            <Input 
              id="redirect-uri"
              className="mt-1"
              value={oauthConfig.redirectUri}
              onChange={(e) => handleChange('redirectUri', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="scopes">Scopes</Label>
            <Input 
              id="scopes"
              className="mt-1"
              value={oauthConfig.scopes}
              onChange={(e) => handleChange('scopes', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated list of scopes (e.g., read,write,profile)
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Save Configuration</Button>
      </CardFooter>
    </Card>
  );
};

const CustomIntegration = () => {
  const [script, setScript] = useState(`// Example integration script
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });`);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Integration</CardTitle>
        <CardDescription>Create custom integrations with JavaScript</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="integration-name">Integration Name</Label>
            <Input 
              id="integration-name"
              className="mt-1"
              placeholder="My Custom Integration"
            />
          </div>
          
          <div>
            <Label htmlFor="integration-script">Script</Label>
            <Textarea 
              id="integration-script"
              className="mt-1 font-mono h-64"
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Custom integration scripts run with limited permissions. They cannot access sensitive data or modify system settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Test Script</Button>
        <Button>Save Integration</Button>
      </CardFooter>
    </Card>
  );
};

export const IntegrationCapabilities = () => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [filter, setFilter] = useState('all');
  
  const handleToggleIntegration = (id: string, enabled: boolean) => {
    console.log(`Toggle integration ${id}: ${enabled}`);
  };
  
  const handleConfigureIntegration = (id: string) => {
    console.log(`Configure integration ${id}`);
  };
  
  const filteredIntegrations = filter === 'all' 
    ? integrations 
    : filter === 'connected' 
      ? integrations.filter(i => i.connected) 
      : integrations.filter(i => !i.connected);
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="oauth">OAuth</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Integrations</h2>
              <p className="text-muted-foreground">Connect with your favorite tools and services</p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Integrations</SelectItem>
                  <SelectItem value="connected">Connected</SelectItem>
                  <SelectItem value="disconnected">Disconnected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => (
              <IntegrationCard 
                key={integration.id}
                integration={integration}
                onToggle={handleToggleIntegration}
                onConfigure={handleConfigureIntegration}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="api-keys" className="mt-6">
          <ApiKeyManagement />
        </TabsContent>
        
        <TabsContent value="webhooks" className="mt-6">
          <WebhookConfiguration />
        </TabsContent>
        
        <TabsContent value="oauth" className="mt-6">
          <OAuthConfiguration />
        </TabsContent>
        
        <TabsContent value="custom" className="mt-6">
          <CustomIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationCapabilities;

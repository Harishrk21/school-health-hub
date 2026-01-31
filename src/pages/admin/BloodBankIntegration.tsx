import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Droplets, Search, MapPin, Phone, Clock, CheckCircle, 
  AlertCircle, RefreshCw, ExternalLink, Download, 
  Calendar, Users, Activity, TrendingUp
} from 'lucide-react';
import { bloodBankAPI, BloodBank, BloodRequest } from '@/services/bloodBankAPI';
import { toast } from '@/hooks/use-toast';
import { BloodGroup } from '@/types';
import { format } from 'date-fns';

export default function BloodBankIntegration() {
  const { students, bloodRequests, addBloodRequest, updateBloodRequest } = useData();
  const [searchResults, setSearchResults] = useState<BloodBank[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [apiStatus, setApiStatus] = useState<'operational' | 'degraded' | 'down'>('operational');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Search form state
  const [searchForm, setSearchForm] = useState({
    bloodGroup: 'O+' as BloodGroup,
    pincode: '600017',
    radiusKm: 10,
  });

  // Request form state
  const [requestForm, setRequestForm] = useState({
    bloodGroup: 'O+' as BloodGroup,
    unitsRequired: 2,
    urgency: 'normal' as 'normal' | 'urgent' | 'critical',
    patientName: '',
    hospital: '',
    contact: '',
  });

  // Calculate school-wide blood group distribution
  const bloodGroupDistribution = React.useMemo(() => {
    const distribution: Record<BloodGroup, number> = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
    };
    students.forEach(s => distribution[s.bloodGroup]++);
    return distribution;
  }, [students]);

  // Calculate eligible donors (18+, 50kg+)
  const eligibleDonors = React.useMemo(() => {
    return students.filter(s => {
      const age = new Date().getFullYear() - new Date(s.dateOfBirth).getFullYear();
      return age >= 18; // Assuming weight check would be in health records
    }).length;
  }, [students]);

  // Test API connection
  const testConnection = async () => {
    setIsSearching(true);
    try {
      const result = await bloodBankAPI.testConnection();
      if (result.status === 'success') {
        setApiStatus('operational');
        setLastSync(new Date());
        toast({
          title: 'API Connection Successful',
          description: 'National Blood Bank API is operational',
        });
      } else {
        setApiStatus('down');
        toast({
          title: 'API Connection Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setApiStatus('down');
      toast({
        title: 'Error',
        description: 'Failed to connect to API',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Search blood availability
  const handleSearchAvailability = async () => {
    setIsSearching(true);
    try {
      const result = await bloodBankAPI.searchBloodAvailability({
        bloodGroup: searchForm.bloodGroup,
        pincode: searchForm.pincode,
        radiusKm: searchForm.radiusKm,
      });

      if (result.status === 'success') {
        setSearchResults(result.data);
        setLastSync(new Date());
        toast({
          title: 'Search Complete',
          description: `Found ${result.data.length} blood banks with availability`,
        });
      } else {
        toast({
          title: 'Search Failed',
          description: result.message || 'Failed to search blood availability',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search blood availability',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Request blood
  const handleRequestBlood = async () => {
    if (!requestForm.patientName || !requestForm.hospital || !requestForm.contact) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const result = await bloodBankAPI.requestBlood({
        requesterName: 'School Health Center',
        requesterType: 'school',
        bloodGroup: requestForm.bloodGroup,
        unitsRequired: requestForm.unitsRequired,
        urgency: requestForm.urgency,
        patientDetails: {
          name: requestForm.patientName,
          hospital: requestForm.hospital,
          contact: requestForm.contact,
        },
      });

      if (result.status === 'success') {
        // Save request to local state
        const newRequest: BloodRequest = {
          id: result.request.requestId,
          bloodGroup: result.request.bloodGroup as BloodGroup,
          unitsRequired: result.request.unitsRequired,
          urgency: result.request.urgency,
          requestedBy: 'admin-001', // Current admin ID
          hospitalName: requestForm.hospital,
          contactNumber: requestForm.contact,
          status: 'Pending',
          requestedAt: new Date().toISOString(),
        };
        addBloodRequest(newRequest);

        toast({
          title: 'Blood Request Submitted',
          description: `Request ID: ${result.request.requestId}. ${result.message}`,
        });

        // Reset form
        setRequestForm({
          bloodGroup: 'O+',
          unitsRequired: 2,
          urgency: 'normal',
          patientName: '',
          hospital: '',
          contact: '',
        });
      } else {
        toast({
          title: 'Request Failed',
          description: result.message || 'Failed to submit blood request',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit blood request',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blood Bank Integration</h1>
        <p className="text-muted-foreground">National Blood Bank API integration and management</p>
      </div>

      {/* API Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-500" />
              National Blood Bank API Status
            </CardTitle>
            <CardDescription>Connection status and last sync time</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={
              apiStatus === 'operational' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : apiStatus === 'degraded'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }
          >
            {apiStatus === 'operational' ? '🟢 Operational' : 
             apiStatus === 'degraded' ? '🟡 Degraded' : '🔴 Down'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="font-medium">{format(lastSync, 'PPp')}</p>
            </div>
            <Button variant="outline" onClick={testConnection} disabled={isSearching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isSearching ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* School Blood Group Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            School Blood Group Distribution
          </CardTitle>
          <CardDescription>Total students by blood type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {Object.entries(bloodGroupDistribution).map(([group, count]) => (
              <div key={group} className="text-center p-3 rounded-lg border bg-red-50 dark:bg-red-950">
                <Droplets className="h-5 w-5 mx-auto mb-1 text-red-500" />
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs font-medium">{group}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eligible Donors (18+)</p>
              <p className="text-2xl font-bold">{eligibleDonors}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">Search Availability</TabsTrigger>
          <TabsTrigger value="request">Request Blood</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
          <TabsTrigger value="donors">Donor Registry</TabsTrigger>
        </TabsList>

        {/* Search Availability Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Blood Availability</CardTitle>
              <CardDescription>Find available blood units from nearby blood banks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchBloodGroup">Blood Group *</Label>
                  <Select
                    value={searchForm.bloodGroup}
                    onValueChange={(value) => setSearchForm({ ...searchForm, bloodGroup: value as BloodGroup })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={searchForm.pincode}
                    onChange={(e) => setSearchForm({ ...searchForm, pincode: e.target.value })}
                    placeholder="600017"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius">Radius (km)</Label>
                  <Select
                    value={searchForm.radiusKm.toString()}
                    onValueChange={(value) => setSearchForm({ ...searchForm, radiusKm: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSearchAvailability} disabled={isSearching} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search API'}
              </Button>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>Found {searchResults.length} blood banks with availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchResults.map((bank) => (
                    <Card key={bank.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{bank.name}</h3>
                              <Badge variant="outline">{bank.distanceKm} km away</Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {bank.address}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {bank.phone}
                              </p>
                              <p className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {bank.operatingHours}
                              </p>
                            </div>
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-1">Available Units:</p>
                              <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                                {bank.bloodInventory[searchForm.bloodGroup] || 0} units of {searchForm.bloodGroup}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              <MapPin className="h-4 w-4 mr-2" />
                              View on Map
                            </Button>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4 mr-2" />
                              Call
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Get Directions
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Request Blood Tab */}
        <TabsContent value="request" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Blood (Emergency)</CardTitle>
              <CardDescription>Submit a blood request through the National Blood Bank API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This request will be submitted to the National Blood Bank API. You will receive a request ID for tracking.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestBloodGroup">Blood Group Needed *</Label>
                  <Select
                    value={requestForm.bloodGroup}
                    onValueChange={(value) => setRequestForm({ ...requestForm, bloodGroup: value as BloodGroup })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitsRequired">Units Required *</Label>
                  <Input
                    id="unitsRequired"
                    type="number"
                    min="1"
                    value={requestForm.unitsRequired}
                    onChange={(e) => setRequestForm({ ...requestForm, unitsRequired: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level *</Label>
                  <Select
                    value={requestForm.urgency}
                    onValueChange={(value) => setRequestForm({ ...requestForm, urgency: value as 'normal' | 'urgent' | 'critical' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={requestForm.patientName}
                    onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital Name *</Label>
                  <Input
                    id="hospital"
                    value={requestForm.hospital}
                    onChange={(e) => setRequestForm({ ...requestForm, hospital: e.target.value })}
                    placeholder="Hospital name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input
                    id="contact"
                    value={requestForm.contact}
                    onChange={(e) => setRequestForm({ ...requestForm, contact: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <Button onClick={handleRequestBlood} disabled={isSearching} className="w-full">
                <Droplets className="h-4 w-4 mr-2" />
                {isSearching ? 'Submitting Request...' : 'Submit Blood Request'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Request History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blood Request History</CardTitle>
              <CardDescription>All blood requests submitted from this school</CardDescription>
            </CardHeader>
            <CardContent>
              {bloodRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bloodRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-xs">{request.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.bloodGroup}</Badge>
                        </TableCell>
                        <TableCell>{request.unitsRequired}</TableCell>
                        <TableCell>
                          <Badge variant={
                            request.urgency === 'critical' ? 'destructive' :
                            request.urgency === 'urgent' ? 'default' : 'secondary'
                          }>
                            {request.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.hospitalName}</TableCell>
                        <TableCell>
                          <Badge variant={
                            request.status === 'Fulfilled' ? 'default' :
                            request.status === 'Pending' ? 'secondary' : 'outline'
                          }>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(request.requestedAt), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No blood requests yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donor Registry Tab */}
        <TabsContent value="donors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligible Blood Donors</CardTitle>
              <CardDescription>Students who are eligible to donate blood (18+ years, 50kg+)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Eligible Donors</p>
                    <p className="text-2xl font-bold">{eligibleDonors}</p>
                  </div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export Donor List
                  </Button>
                </div>
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    Eligible donors are students who are 18 years or older. Weight verification should be done through health records.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


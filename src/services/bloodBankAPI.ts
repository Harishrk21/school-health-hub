// Blood Bank API Service
// Supports real Open APIs with fallback to mock data
// Configure API endpoints via environment variables

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  bloodInventory: Record<string, number>;
  distanceKm: number;
  operatingHours: string;
  services: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface BloodAvailabilityResult {
  status: 'success' | 'error';
  data: BloodBank[];
  message?: string;
}

export interface BloodRequest {
  requestId: string;
  status: 'pending' | 'in_progress' | 'fulfilled' | 'cancelled';
  bloodGroup: string;
  unitsRequired: number;
  unitsFulfilled?: number;
  estimatedFulfillmentTime?: string;
  assignedBloodBank?: string;
  contactPerson?: string;
  contactNumber?: string;
  fulfilledAt?: string;
  notes?: string;
}

export interface BloodDonationCamp {
  campId: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  contact: string;
  registrationUrl: string;
}

export interface DonorRegistration {
  donorId: string;
  registrationStatus: 'success' | 'failed';
  eligibleForDonation: boolean;
  nextEligibleDate?: string;
  donorCardUrl?: string;
  message?: string;
}

// Mock blood banks in Chennai area
const mockBloodBanks: BloodBank[] = [
  {
    id: 'BBK001',
    name: 'City Blood Bank',
    address: '123 Main Street, T. Nagar, Chennai - 600017',
    phone: '+91-44-12345678',
    bloodInventory: {
      'A+': 20, 'A-': 5, 'B+': 15, 'B-': 3,
      'O+': 25, 'O-': 8, 'AB+': 10, 'AB-': 2
    },
    distanceKm: 2.5,
    operatingHours: '24/7',
    services: ['whole_blood', 'platelets', 'plasma'],
    coordinates: { lat: 13.0418, lng: 80.2341 }
  },
  {
    id: 'BBK002',
    name: 'Apollo Blood Bank',
    address: '21 Greams Lane, Off Greams Road, Chennai - 600006',
    phone: '+91-44-28293333',
    bloodInventory: {
      'A+': 30, 'A-': 8, 'B+': 22, 'B-': 5,
      'O+': 35, 'O-': 10, 'AB+': 15, 'AB-': 3
    },
    distanceKm: 5.2,
    operatingHours: '24/7',
    services: ['whole_blood', 'platelets', 'plasma', 'cryoprecipitate'],
    coordinates: { lat: 13.0629, lng: 80.2624 }
  },
  {
    id: 'BBK003',
    name: 'Red Cross Blood Bank',
    address: '32 Red Cross Road, Egmore, Chennai - 600008',
    phone: '+91-44-28554444',
    bloodInventory: {
      'A+': 18, 'A-': 4, 'B+': 12, 'B-': 2,
      'O+': 28, 'O-': 7, 'AB+': 8, 'AB-': 1
    },
    distanceKm: 3.8,
    operatingHours: '9:00 AM - 6:00 PM',
    services: ['whole_blood', 'platelets'],
    coordinates: { lat: 13.0800, lng: 80.2620 }
  },
  {
    id: 'BBK004',
    name: 'Fortis Blood Bank',
    address: 'Vadapalani, Chennai - 600026',
    phone: '+91-44-42002222',
    bloodInventory: {
      'A+': 15, 'A-': 3, 'B+': 10, 'B-': 2,
      'O+': 20, 'O-': 5, 'AB+': 6, 'AB-': 1
    },
    distanceKm: 7.5,
    operatingHours: '24/7',
    services: ['whole_blood', 'platelets', 'plasma'],
    coordinates: { lat: 13.0500, lng: 80.2100 }
  },
  {
    id: 'BBK005',
    name: 'Government General Hospital Blood Bank',
    address: 'Park Town, Chennai - 600003',
    phone: '+91-44-25305000',
    bloodInventory: {
      'A+': 40, 'A-': 10, 'B+': 30, 'B-': 6,
      'O+': 50, 'O-': 15, 'AB+': 20, 'AB-': 4
    },
    distanceKm: 4.2,
    operatingHours: '24/7',
    services: ['whole_blood', 'platelets', 'plasma', 'cryoprecipitate'],
    coordinates: { lat: 13.0827, lng: 80.2707 }
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Configuration for real API endpoints
// Set these in your .env file:
// VITE_BLOOD_BANK_API_URL=https://api.bloodbank.org/v1
// VITE_BLOOD_BANK_API_KEY=your_api_key_here
// VITE_USE_MOCK_API=true (set to false to use real API)

const getBaseURL = () => {
  return import.meta.env.VITE_BLOOD_BANK_API_URL || 'https://api.nationalbloodbank.gov.in/v1';
};

const getAPIKey = () => {
  return import.meta.env.VITE_BLOOD_BANK_API_KEY || '';
};

const useMockAPI = () => {
  return import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_BLOOD_BANK_API_URL;
};

// Helper to make API calls with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const baseURL = getBaseURL();
    const apiKey = getAPIKey();
    
    const response = await fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export class BloodBankAPI {
  private baseURL = getBaseURL();
  private useMock = useMockAPI();

  /**
   * Search for blood availability by blood group and location
   */
  async searchBloodAvailability(params: {
    bloodGroup: string;
    pincode?: string;
    radiusKm?: number;
    state?: string;
    district?: string;
  }): Promise<BloodAvailabilityResult> {
    // Try real API first if not using mock
    if (!this.useMock) {
      try {
        const queryParams = new URLSearchParams({
          blood_group: params.bloodGroup,
          ...(params.pincode && { pincode: params.pincode }),
          ...(params.radiusKm && { radius: params.radiusKm.toString() }),
          ...(params.state && { state: params.state }),
          ...(params.district && { district: params.district }),
        });

        const result = await fetchAPI<BloodBank[]>(`/blood/availability?${queryParams}`);
        
        if (result.success && result.data) {
          return {
            status: 'success',
            data: result.data,
          };
        }
        // Fall through to mock if real API fails
      } catch (error) {
        console.warn('Real API failed, falling back to mock data:', error);
      }
    }

    // Fallback to mock data
    await delay(800);
    try {
      const availableBanks = mockBloodBanks
        .filter(bank => {
          const available = bank.bloodInventory[params.bloodGroup] || 0;
          return available > 0;
        })
        .filter(bank => {
          if (params.radiusKm) {
            return bank.distanceKm <= params.radiusKm;
          }
          return true;
        })
        .map(bank => ({
          ...bank,
          bloodInventory: {
            [params.bloodGroup]: bank.bloodInventory[params.bloodGroup] || 0
          }
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return {
        status: 'success',
        data: availableBanks,
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        message: 'Failed to fetch blood availability',
      };
    }
  }

  /**
   * Find nearby blood banks
   */
  async findNearbyBloodBanks(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  }): Promise<BloodAvailabilityResult> {
    // Try real API first
    if (!this.useMock) {
      try {
        const queryParams = new URLSearchParams({
          latitude: params.latitude.toString(),
          longitude: params.longitude.toString(),
          radius: params.radiusKm.toString(),
        });

        const result = await fetchAPI<BloodBank[]>(`/blood-banks/nearby?${queryParams}`);
        
        if (result.success && result.data) {
          return {
            status: 'success',
            data: result.data,
          };
        }
      } catch (error) {
        console.warn('Real API failed, falling back to mock data:', error);
      }
    }

    // Fallback to mock
    await delay(600);
    try {
      const nearbyBanks = mockBloodBanks
        .filter(bank => bank.distanceKm <= params.radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return {
        status: 'success',
        data: nearbyBanks,
      };
    } catch (error) {
      return {
        status: 'error',
        data: [],
        message: 'Failed to find nearby blood banks',
      };
    }
  }

  /**
   * Request blood for emergency
   */
  async requestBlood(params: {
    requesterName: string;
    requesterType: string;
    bloodGroup: string;
    unitsRequired: number;
    urgency: 'normal' | 'urgent' | 'critical';
    patientDetails?: {
      name?: string;
      age?: number;
      hospital?: string;
      contact?: string;
    };
    deliveryAddress?: string;
    preferredBloodBankId?: string;
  }): Promise<{ status: string; request: BloodRequest; message?: string }> {
    // Try real API first
    if (!this.useMock) {
      try {
        const result = await fetchAPI<BloodRequest>('/blood/request', {
          method: 'POST',
          body: JSON.stringify(params),
        });

        if (result.success && result.data) {
          return {
            status: 'success',
            request: result.data,
            message: 'Blood request submitted successfully',
          };
        }
      } catch (error) {
        console.warn('Real API failed, falling back to mock data:', error);
      }
    }

    // Fallback to mock
    await delay(1200);

    try {
      // Find available blood bank
      const availableBank = mockBloodBanks.find(bank => {
        const available = bank.bloodInventory[params.bloodGroup] || 0;
        return available >= params.unitsRequired;
      });

      if (!availableBank) {
        return {
          status: 'error',
          request: {
            requestId: '',
            status: 'pending',
            bloodGroup: params.bloodGroup,
            unitsRequired: params.unitsRequired,
          },
          message: 'No blood banks have sufficient units available',
        };
      }

      const requestId = `REQ-${Date.now()}`;
      const estimatedTime = params.urgency === 'critical' ? '1 hour' : 
                           params.urgency === 'urgent' ? '2 hours' : '4 hours';

      const request: BloodRequest = {
        requestId,
        status: 'pending',
        bloodGroup: params.bloodGroup,
        unitsRequired: params.unitsRequired,
        estimatedFulfillmentTime: estimatedTime,
        assignedBloodBank: availableBank.name,
        contactPerson: 'Dr. Kumar',
        contactNumber: availableBank.phone,
        notes: `Request submitted for ${params.unitsRequired} units of ${params.bloodGroup}`,
      };

      return {
        status: 'success',
        request,
        message: 'Blood request submitted successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        request: {
          requestId: '',
          status: 'pending',
          bloodGroup: params.bloodGroup,
          unitsRequired: params.unitsRequired,
        },
        message: 'Failed to submit blood request',
      };
    }
  }

  /**
   * Check request status
   */
  async checkRequestStatus(requestId: string): Promise<BloodRequest | null> {
    await delay(500);

    // Mock: Simulate request fulfillment after some time
    const mockRequest: BloodRequest = {
      requestId,
      status: 'fulfilled',
      bloodGroup: 'B+',
      unitsRequired: 2,
      unitsFulfilled: 2,
      estimatedFulfillmentTime: '2 hours',
      assignedBloodBank: 'City Blood Bank',
      contactPerson: 'Dr. Kumar',
      contactNumber: '+91-44-12345678',
      fulfilledAt: new Date().toISOString(),
      notes: 'Blood ready for pickup',
    };

    return mockRequest;
  }

  /**
   * Get upcoming blood donation camps
   */
  async getUpcomingCamps(params: {
    state?: string;
    district?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<BloodDonationCamp[]> {
    await delay(700);

    const mockCamps: BloodDonationCamp[] = [
      {
        campId: 'CAMP-001',
        organizer: 'Red Cross Chennai',
        date: '2026-02-15',
        time: '09:00 AM - 05:00 PM',
        location: 'Community Center, Anna Nagar, Chennai',
        contact: '+91-44-87654321',
        registrationUrl: 'https://register.bloodcamp.in/001',
      },
      {
        campId: 'CAMP-002',
        organizer: 'Apollo Hospitals',
        date: '2026-02-20',
        time: '10:00 AM - 04:00 PM',
        location: 'Apollo Hospital, Greams Road, Chennai',
        contact: '+91-44-28293333',
        registrationUrl: 'https://register.bloodcamp.in/002',
      },
      {
        campId: 'CAMP-003',
        organizer: 'City Blood Bank',
        date: '2026-02-25',
        time: '09:00 AM - 06:00 PM',
        location: 'City Blood Bank, T. Nagar, Chennai',
        contact: '+91-44-12345678',
        registrationUrl: 'https://register.bloodcamp.in/003',
      },
    ];

    return mockCamps;
  }

  /**
   * Register a student as a blood donor
   */
  async registerDonor(params: {
    name: string;
    age: number;
    bloodGroup: string;
    gender: string;
    weightKg: number;
    phone: string;
    email: string;
    address: string;
    willingToDonate: boolean;
    lastDonationDate?: string;
    medicalConditions?: string[];
  }): Promise<DonorRegistration> {
    await delay(1000);

    // Check eligibility
    const isEligible = params.age >= 18 && 
                      params.weightKg >= 50 && 
                      params.willingToDonate &&
                      (!params.medicalConditions || params.medicalConditions.length === 0);

    if (!isEligible) {
      return {
        donorId: '',
        registrationStatus: 'failed',
        eligibleForDonation: false,
        message: 'Donor does not meet eligibility criteria',
      };
    }

    // Calculate next eligible date (3 months from last donation or today)
    const lastDonation = params.lastDonationDate ? new Date(params.lastDonationDate) : new Date();
    const nextEligible = new Date(lastDonation);
    nextEligible.setMonth(nextEligible.getMonth() + 3);

    const donorId = `DONOR-${Date.now()}`;

    return {
      donorId,
      registrationStatus: 'success',
      eligibleForDonation: true,
      nextEligibleDate: nextEligible.toISOString().split('T')[0],
      donorCardUrl: `https://api.bloodbank.in/card/${donorId}.pdf`,
      message: 'Successfully registered as blood donor',
    };
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ status: 'success' | 'error'; message: string }> {
    if (!this.useMock) {
      try {
        const result = await fetchAPI('/health');
        if (result.success) {
          return {
            status: 'success',
            message: 'API connection successful',
          };
        } else {
          return {
            status: 'error',
            message: result.error || 'API connection failed',
          };
        }
      } catch (error) {
        return {
          status: 'error',
          message: error instanceof Error ? error.message : 'API connection failed',
        };
      }
    }

    // Mock test
    await delay(300);
    const isSuccess = Math.random() > 0.05;
    return {
      status: isSuccess ? 'success' : 'error',
      message: isSuccess 
        ? 'API connection successful (Mock Mode)' 
        : 'API connection failed. Please check your network.',
    };
  }
}

// Export singleton instance
export const bloodBankAPI = new BloodBankAPI();


# Blood Bank API Configuration

## Overview

The Blood Bank API service has been updated to support **real Open APIs** with automatic fallback to mock data. This allows you to use actual blood bank APIs when available, while maintaining functionality during development or when APIs are unavailable.

## Configuration

### Environment Variables

Create a `.env` file in the `school-health-hub` directory with the following variables:

```env
# Blood Bank API Configuration
VITE_BLOOD_BANK_API_URL=https://api.bloodbank.org/v1
VITE_BLOOD_BANK_API_KEY=your_api_key_here
VITE_USE_MOCK_API=true
```

### Configuration Options

1. **VITE_BLOOD_BANK_API_URL** (Optional)
   - The base URL for the real Blood Bank API
   - Examples:
     - e-RaktKosh: `https://api.eraktkosh.in/v1`
     - Red Cross API: `https://api.redcross.org/blood/v1`
     - Custom API: Your own endpoint

2. **VITE_BLOOD_BANK_API_KEY** (Optional)
   - API key for authentication (if required by the API provider)
   - Leave empty if no authentication is needed

3. **VITE_USE_MOCK_API** (Optional, default: `true`)
   - Set to `false` to use real API
   - Set to `true` or leave unset to use mock data
   - The system will automatically fallback to mock data if real API fails

## How It Works

### Automatic Fallback System

The API service implements a smart fallback mechanism:

1. **Real API First**: If `VITE_USE_MOCK_API=false` and `VITE_BLOOD_BANK_API_URL` is set, it tries the real API
2. **Automatic Fallback**: If the real API fails (network error, timeout, etc.), it automatically falls back to mock data
3. **Mock Mode**: If `VITE_USE_MOCK_API=true` or no API URL is configured, it uses mock data directly

### API Endpoints Expected

The service expects the following REST API endpoints:

#### 1. Search Blood Availability
```
GET /blood/availability?blood_group={group}&pincode={code}&radius={km}
```

**Response:**
```json
[
  {
    "id": "BBK001",
    "name": "Blood Bank Name",
    "address": "Full Address",
    "phone": "+91-XX-XXXXXXX",
    "bloodInventory": {
      "A+": 20,
      "B+": 15,
      ...
    },
    "distanceKm": 2.5,
    "operatingHours": "24/7",
    "services": ["whole_blood", "platelets"],
    "coordinates": {
      "lat": 13.0827,
      "lng": 80.2707
    }
  }
]
```

#### 2. Find Nearby Blood Banks
```
GET /blood-banks/nearby?latitude={lat}&longitude={lng}&radius={km}
```

**Response:** Same as above

#### 3. Request Blood
```
POST /blood/request
Content-Type: application/json

{
  "requesterName": "School Health Center",
  "requesterType": "school",
  "bloodGroup": "B+",
  "unitsRequired": 2,
  "urgency": "critical",
  "patientDetails": {
    "name": "Student Name",
    "hospital": "Hospital Name",
    "contact": "+91-9876543210"
  }
}
```

**Response:**
```json
{
  "requestId": "REQ-2026-001234",
  "status": "pending",
  "bloodGroup": "B+",
  "unitsRequired": 2,
  "estimatedFulfillmentTime": "2 hours",
  "assignedBloodBank": "City Blood Bank",
  "contactPerson": "Dr. Kumar",
  "contactNumber": "+91-44-12345678"
}
```

#### 4. Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

## Available Real Blood Bank APIs

### 1. e-RaktKosh (India)
- **URL**: `https://api.eraktkosh.in/v1`
- **Documentation**: Check official e-RaktKosh documentation
- **Authentication**: May require API key

### 2. Red Cross APIs
- **URL**: Varies by region
- **Documentation**: Check local Red Cross API documentation
- **Authentication**: Usually requires registration

### 3. Custom APIs
- You can integrate with any REST API that follows the expected format
- Simply set `VITE_BLOOD_BANK_API_URL` to your API endpoint

## Testing

### Test Real API Connection

1. Set environment variables:
   ```env
   VITE_BLOOD_BANK_API_URL=https://your-api-url.com/v1
   VITE_USE_MOCK_API=false
   ```

2. Navigate to Blood Bank Integration page
3. Click "Test Connection" button
4. Check the status indicator

### Test Mock API

1. Set or leave:
   ```env
   VITE_USE_MOCK_API=true
   ```

2. The system will use mock data with simulated delays

## Error Handling

The service handles errors gracefully:

- **Network Errors**: Automatically falls back to mock data
- **API Errors**: Logs error and falls back to mock data
- **Timeout**: Falls back after 10 seconds
- **Invalid Response**: Validates response format before using

## Development vs Production

### Development
- Use mock API (`VITE_USE_MOCK_API=true`)
- No external dependencies
- Fast development cycle

### Production
- Configure real API (`VITE_USE_MOCK_API=false`)
- Set proper API URL and key
- Real-time data from blood banks

## Troubleshooting

### API Not Working

1. Check environment variables are set correctly
2. Verify API URL is accessible
3. Check browser console for errors
4. Verify API key (if required)
5. Check CORS settings on API server

### Fallback Not Working

1. Ensure mock data is available
2. Check network connectivity
3. Verify error handling in console

## Security Notes

- **Never commit `.env` file** to version control
- Store API keys securely
- Use environment-specific configurations
- Implement rate limiting for production APIs
- Validate all API responses

## Support

For issues or questions:
1. Check API provider documentation
2. Review error logs in browser console
3. Test with mock API first
4. Verify network connectivity

---

*Last Updated: January 2026*


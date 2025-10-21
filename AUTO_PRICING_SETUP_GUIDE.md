# 🤖 Auto-Pricing & Route Mapping Setup Guide

## 🎯 **What's Been Implemented**

### ✅ **Automatic Price Calculation**
- **AI-powered pricing engine** that calculates costs based on:
  - Accommodation type and duration
  - Number of attractions and restaurants
  - Total route distance
  - Agency margins and taxes
- **Real-time price updates** when itinerary is generated
- **Detailed price breakdown** showing all cost components

### ✅ **Route Map Integration**
- **Google Maps integration** for accurate route display
- **Distance calculation** using haversine formula
- **Visual route markers** with numbered stops
- **Total distance and travel time** estimation

### ✅ **Enhanced Itinerary Generation**
- **AI service integration** with pricing calculations
- **Route coordinate extraction** for mapping
- **Comprehensive cost analysis** with breakdown

## 🚀 **Setup Instructions**

### **1. Environment Variables Setup**

Create a `.env` file in the `vite-project` directory with:

```env
# Google Maps API Key for Route Mapping
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google Places API Key for Hotel/Restaurant Search  
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API Key for AI Itinerary Generation (Optional)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### **2. Google Maps API Setup**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable APIs**:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
4. **Create API Key**:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the key to your domain for security
5. **Add to environment variables**

### **3. Backend AI Service Setup**

The AI service is already configured with:
- **Port 5055** for itinerary generation
- **OpenAI integration** (optional)
- **Distance calculation** using haversine formula
- **Comprehensive pricing model**

### **4. Start the Services**

```bash
# Start the AI service (Terminal 1)
cd backend/ai
python itinerary_generator_service.py

# Start the backend (Terminal 2)
cd backend
npm start

# Start the frontend (Terminal 3)
cd vite-project
npm run dev
```

## 💰 **Pricing Model Details**

### **Base Costs (per component)**
- **Accommodation**: $80/night
- **Attractions**: $25/attraction
- **Restaurants**: $35/restaurant/day
- **Transport**: $50/day
- **Guide**: $100/day
- **Insurance**: $15/day

### **Distance-Based Pricing**
- **Base transport**: Included in daily rate
- **Additional cost**: $0.5/km over 50km
- **Calculated using**: Haversine distance formula

### **Fees & Margins**
- **Agency margin**: 15% of subtotal
- **Service fee**: 5% of subtotal
- **Taxes**: 8% of subtotal

## 🗺️ **Route Mapping Features**

### **Map Display**
- **Numbered markers** for each location
- **Route polyline** connecting all stops
- **Distance calculation** in kilometers
- **Travel time estimation** (60km/h average)

### **Location Types**
- **Attractions** with visit duration
- **Accommodations** with ratings
- **Restaurants** with cuisine types

## 🎯 **How It Works**

### **1. Itinerary Generation**
```
User clicks "Auto-generate Itinerary" 
    ↓
AI service calculates route and pricing
    ↓
Frontend receives pricing data
    ↓
Price field auto-populates
    ↓
Route map displays with markers
```

### **2. Price Calculation Flow**
```
Base costs calculation
    ↓
Distance-based adjustments
    ↓
Fees and margins addition
    ↓
Final price with breakdown
```

### **3. Route Mapping Process**
```
Extract coordinates from itinerary
    ↓
Calculate total distance
    ↓
Display Google Maps with markers
    ↓
Show route polyline
```

## 🔧 **Technical Implementation**

### **Backend Changes**
- **Enhanced AI service** with pricing functions
- **Distance calculation** using haversine formula
- **Route coordinate extraction**
- **Comprehensive pricing model**

### **Frontend Changes**
- **RouteMap component** for Google Maps integration
- **Auto-pricing integration** in StepByStepPackageForm
- **Price breakdown display** with detailed costs
- **Real-time route visualization**

### **Key Files Modified**
- `backend/ai/itinerary_generator_service.py` - AI service with pricing
- `vite-project/src/components/RouteMap.jsx` - New map component
- `vite-project/src/components/StepByStepPackageForm.jsx` - Integration
- `vite-project/src/components/RouteMap.module.scss` - Map styles

## 🎉 **Result**

The system now provides:
1. **Automatic price calculation** based on itinerary components
2. **Accurate route mapping** with Google Maps integration
3. **Detailed price breakdown** showing all cost factors
4. **Real-time updates** when itinerary is generated
5. **Professional presentation** of pricing and routes

The price field will automatically populate after clicking "Auto-generate Itinerary", and the route map will display the exact route with all stops and total distance calculation.

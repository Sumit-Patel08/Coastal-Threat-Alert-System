# CoastalAlert — Coastal Threat Alert System

A comprehensive coastal threat monitoring and response platform with role-based dashboards for governments, NGOs, disaster teams, civil defence, and coastal communities.

## Landing Page

The public homepage (`/`) introduces CoastalAlert through the sections below. Navigation includes **Features**, **Interactive**, **Visual Stories**, **Blue Carbon**, **Interconnectivity**, **About**, **Dashboards**, **Sign in**, and **Get Started**.

### Coastal Threat Alert System (Hero)

Monitor storm surge, flooding, and erosion risks. Share timely alerts with residents, planners, and responders to protect coastal communities.

- **Open Dashboard** — jump into role-based monitoring
- **View Live Map** — explore coastal risk and live conditions
- Live coastal imagery with a **Live View** indicator

### Comprehensive Coastal Protection (Features)

Core platform capabilities shown on the Features section:

| Feature | Description |
| --- | --- |
| **Real-time Alerts** | Instant notifications for coastal threats and emergencies with severity levels and recommended actions |
| **Risk Assessment** | AI-powered analysis of coastal conditions to predict and assess threats before they escalate |
| **Interactive Map** | Visual representation of risk zones, weather patterns, and emergency resources |
| **Community Dashboard** | Connect with local authorities and community members to coordinate responses |
| **Weather Integration** | Real-time weather data for forecasting and early warning systems |
| **Analytics & Reports** | Tools for tracking trends and improving response strategies |

### Blue Carbon Ecosystems: Nature's Coastal Defense

Blue carbon ecosystems—mangroves, seagrasses, and salt marshes—store carbon up to **10× faster** than terrestrial forests while protecting coastlines.

#### Ecosystem Types

| Ecosystem | Carbon Storage | Protection | Key Benefits |
| --- | --- | --- | --- |
| **Mangroves** | 1,023 tons CO₂/hectare | Reduces wave energy by 70% | Storm surge protection, nursery habitats, coastal stabilization |
| **Seagrass Meadows** | 830 tons CO₂/hectare | Reduces wave height by 36% | Water filtration, oxygen production, marine biodiversity |
| **Salt Marshes** | 687 tons CO₂/hectare | Absorbs 70% of wave energy | Flood control, wildlife habitat, water purification |

#### Global Blue Carbon Impact

| Metric | Value |
| --- | --- |
| Global Coverage | **49 million hectares** |
| Carbon Storage | **25.5 billion tons** |
| Annual Sequestration | **216 million tons CO₂** |
| Economic Value | **$48,000 / hectare / year** |

### Five-Dashboard Stakeholder Network (Interconnectivity)

Each stakeholder group has a specialized dashboard tailored to its needs, with shared situational awareness across the network.

#### Government Agencies
- **Role:** Policy makers and regulatory oversight
- **Responsibilities:** Emergency response coordination, resource allocation, public safety regulations, infrastructure planning
- **Connected to:** NGOs, Disaster Management, Civic Organizations

#### NGOs & Environmental Groups
- **Role:** Community advocacy and environmental protection
- **Responsibilities:** Community outreach, environmental monitoring, awareness campaigns, conservation projects
- **Connected to:** Government, Civic Organizations, Disaster Management

#### Civic Organizations
- **Role:** Community representation and local action
- **Responsibilities:** Local mobilization, volunteer coordination, public awareness, grassroots initiatives
- **Connected to:** NGOs, Government, Disaster Management

#### Disaster Management
- **Role:** Emergency response and crisis management
- **Responsibilities:** Emergency response, risk assessment, evacuation planning, recovery coordination
- **Connected to:** Government, NGOs, Civic Organizations

#### Coastal Communities
- **Role:** Direct beneficiaries and local knowledge providers
- **Responsibilities:** Local threat reporting, community preparedness, traditional knowledge sharing, early warning dissemination
- **Connected to:** All stakeholder groups

## Role-Based Dashboards

### Role-Based Authentication System
- **5 distinct user roles** with specialized dashboards
- **Secure access control** based on user roles
- **Automatic role-based routing** after login
- **Profile management** with role assignment

### User Roles & Dashboards

#### 1. Disaster Management Departments
- **Risk heatmaps** of coastal regions
- **Alert logs** and notifications from Supabase
- **Historical trends** of sea levels, cyclones, pollution
- **Charts** with severity scores and probability of events
- **Emergency response tools** and coordination features

#### 2. Coastal City Governments
- **Regional monitoring** dashboards
- **Policy insights** and forecasting charts
- **Summary of alerts** affecting city coastal zones
- **Map visualizations** highlighting vulnerable areas
- **City-specific metrics** and population data

#### 3. Environmental NGOs
- **Satellite imagery** analysis (mocked for MVP)
- **Pollution and algal bloom alerts** from Supabase
- **Environmental impact charts** and trends
- **Blue Carbon section** visualizing coastal carbon stocks
- **Ecosystem health monitoring** tools

#### 4. Fisherfolk
- **Mobile-friendly, simplified** dashboard
- **Live alerts** for sea-level rise, cyclones, unsafe conditions
- **Safety tips** and short awareness messages
- **Map** showing nearby coastal conditions
- **Emergency contacts** and weather forecasts

#### 5. Civil Defence Teams
- **Operational dashboards** with emergency coordination tools
- **Checklist** for disaster preparedness
- **Mock alert system** showing action items
- **Map** with demo evacuation routes
- **Team deployment** and status tracking

## Technical Implementation

### Database Schema
```sql
-- Updated profiles table with new roles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  organization TEXT,
  role TEXT NOT NULL DEFAULT 'fisherfolk' 
    CHECK (role IN ('disaster_management','coastal_government','environmental_ngo','fisherfolk','civil_defence')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Authentication Flow
1. **User Registration**: Select role during sign-up
2. **Profile Creation**: Automatically create profile with selected role
3. **Login**: Authenticate and redirect to role-specific dashboard
4. **Access Control**: Block unauthorized access based on roles

### Dashboard Routing
- `/dashboard` → Role detection and redirect
- `/dashboard/disaster-management` → Disaster Management Dashboard
- `/dashboard/coastal-government` → Coastal Government Dashboard
- `/dashboard/environmental-ngo` → Environmental NGO Dashboard
- `/dashboard/fisherfolk` → Fisherfolk Dashboard
- `/dashboard/civil-defence` → Civil Defence Dashboard

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account and project
- pnpm or npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd coastal-threat-project

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Run database migrations
# Execute SQL scripts in scripts/ folder

# Start development server
pnpm dev
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

### Database Setup
1. Execute `scripts/001_profiles.sql` to create the profiles table
2. Execute `scripts/002_profile_trigger.sql` so new users get a profile automatically
3. Execute `scripts/007_seed_demo_users.sql` to create the demo accounts below
4. (Optional) Run remaining scripts in `scripts/` for alerts and sample data

### Demo Accounts (work offline — no Supabase required)

Use these sample logins at `/auth/login`. Demo accounts use a **local session cookie** so you can open every role dashboard even when Supabase is down. Real Supabase email/password login still works when the project is available.

| Dashboard | Email (username) | Password | Dashboard path |
| --- | --- | --- | --- |
| Disaster Management | `disaster@demo.com` | `demo123` | `/dashboard/disaster-management` |
| Coastal City Government | `government@demo.com` | `demo123` | `/dashboard/coastal-government` |
| Environmental NGO | `ngo@demo.com` | `demo123` | `/dashboard/environmental-ngo` |
| Fisherfolk | `fisher@demo.com` | `demo123` | `/dashboard/fisherfolk` |
| Civil Defence | `defence@demo.com` | `demo123` | `/dashboard/civil-defence` |

All demo accounts share the simplified password **`demo123`**.

On the login page, click a role button to auto-fill credentials, then press **Login**.

Optional: when Supabase is available again, you can also seed the same emails into Auth with `scripts/007_seed_demo_users.sql` or `node scripts/seed-demo-users.mjs`.

## 🎨 UI Components

### Design System
- **Shadcn/ui** components for consistent design
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Responsive design** for all screen sizes

### Dashboard Features
- **Tabbed interfaces** for organized information
- **Card-based layouts** for easy scanning
- **Status badges** for quick identification
- **Interactive elements** for user engagement
- **Mobile-first design** for accessibility

## 🔒 Security Features

### Role-Based Access Control
- **Server-side role verification** on all dashboard routes
- **Automatic redirects** for unauthorized access
- **Profile-based permissions** stored in Supabase
- **Secure authentication** with Supabase Auth

### Data Protection
- **Row Level Security** (RLS) policies in Supabase
- **User isolation** - users can only access their own profiles
- **Secure API routes** with authentication middleware

## 📱 Mobile Responsiveness

### Fisherfolk Dashboard
- **Optimized for mobile devices**
- **Touch-friendly interface**
- **Simplified navigation**
- **Quick access to critical information**

### All Dashboards
- **Responsive grid layouts**
- **Adaptive card sizes**
- **Mobile-optimized buttons and inputs**

## 🔮 Future Enhancements

### Planned Features
- **Real-time data integration** with weather APIs
- **Interactive maps** using Mapbox/Leaflet
- **Chart visualizations** with Chart.js/D3.js
- **Push notifications** for critical alerts
- **SMS integration** for emergency broadcasts
- **Advanced analytics** and reporting tools

### Integration Possibilities
- **Weather APIs** (OpenWeatherMap, AccuWeather)
- **Satellite data** (NASA APIs, Copernicus)
- **IoT sensors** for real-time monitoring
- **Social media** for public awareness
- **Government databases** for policy integration

## 🤝 Contributing

### Development Guidelines
- Follow **TypeScript** best practices
- Use **conventional commits** for version control
- Maintain **responsive design** principles
- Write **comprehensive tests** for new features
- Update **documentation** for API changes

### Code Structure
```
app/
├── auth/           # Authentication pages
├── dashboard/      # Role-based dashboards
├── api/           # API routes
└── globals.css    # Global styles

components/
├── dashboard/     # Dashboard-specific components
├── ui/           # Reusable UI components
└── site/         # Landing page components

lib/
├── supabase/     # Supabase client configuration
└── utils.ts      # Utility functions
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Supabase** for backend infrastructure
- **Shadcn/ui** for component library
- **Next.js** for the React framework
- **Tailwind CSS** for styling utilities

---

**Note**: This is a hackathon MVP with mock data. Production deployment requires real data integration, additional security measures, and comprehensive testing.

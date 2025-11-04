-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('laborer', 'employer', 'artisan');
CREATE TYPE public.job_category AS ENUM ('construction', 'agriculture', 'shop_renovation', 'apartment_association', 'custom_craft');
CREATE TYPE public.wage_type AS ENUM ('hourly', 'daily', 'project');
CREATE TYPE public.job_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.application_status AS ENUM ('submitted', 'under_review', 'accepted', 'rejected');
CREATE TYPE public.payment_status AS ENUM ('pending', 'held', 'released', 'completed');
CREATE TYPE public.bid_status AS ENUM ('pending', 'accepted', 'rejected');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  language TEXT DEFAULT 'en',
  trust_score DECIMAL(3,2) DEFAULT 0.00 CHECK (trust_score >= 0 AND trust_score <= 5),
  verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  location TEXT,
  hourly_rate DECIMAL(10,2),
  completed_jobs_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category job_category NOT NULL,
  wage DECIMAL(10,2) NOT NULL,
  wage_type wage_type NOT NULL,
  location TEXT NOT NULL,
  required_skills TEXT[],
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  status job_status DEFAULT 'open',
  applicants_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  laborer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  expected_wage DECIMAL(10,2),
  status application_status DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, laborer_id)
);

-- Bids table (for CustomCraft)
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bid_amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  estimated_days INTEGER,
  status bid_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments table (simulated)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, reviewer_id, reviewee_id)
);

-- Messages table (simulated)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Custom craft uploads table
CREATE TABLE public.custom_craft_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_craft_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for jobs
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
  FOR SELECT USING (true);

CREATE POLICY "Employers can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs" ON public.jobs
  FOR DELETE USING (auth.uid() = employer_id);

-- RLS Policies for applications
CREATE POLICY "Applications viewable by job owner and applicant" ON public.applications
  FOR SELECT USING (
    auth.uid() = laborer_id OR 
    auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id)
  );

CREATE POLICY "Laborers can create applications" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = laborer_id);

CREATE POLICY "Applicants can update their own applications" ON public.applications
  FOR UPDATE USING (auth.uid() = laborer_id);

CREATE POLICY "Employers can update applications for their jobs" ON public.applications
  FOR UPDATE USING (
    auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id)
  );

-- RLS Policies for bids
CREATE POLICY "Bids viewable by job owner and bidder" ON public.bids
  FOR SELECT USING (
    auth.uid() = artisan_id OR 
    auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id)
  );

CREATE POLICY "Artisans can create bids" ON public.bids
  FOR INSERT WITH CHECK (auth.uid() = artisan_id);

CREATE POLICY "Artisans can update their own bids" ON public.bids
  FOR UPDATE USING (auth.uid() = artisan_id);

-- RLS Policies for payments
CREATE POLICY "Payments viewable by payer and payee" ON public.payments
  FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE POLICY "Payers can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = payer_id);

CREATE POLICY "Payers can update their payments" ON public.payments
  FOR UPDATE USING (auth.uid() = payer_id);

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for custom_craft_uploads
CREATE POLICY "Uploads viewable by job owner" ON public.custom_craft_uploads
  FOR SELECT USING (
    auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id)
  );

CREATE POLICY "Job owners can upload images" ON public.custom_craft_uploads
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT employer_id FROM public.jobs WHERE id = job_id)
  );

-- Create indexes for better performance
CREATE INDEX idx_jobs_employer ON public.jobs(employer_id);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_applications_job ON public.applications(job_id);
CREATE INDEX idx_applications_laborer ON public.applications(laborer_id);
CREATE INDEX idx_bids_job ON public.bids(job_id);
CREATE INDEX idx_bids_artisan ON public.bids(artisan_id);
CREATE INDEX idx_payments_job ON public.payments(job_id);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
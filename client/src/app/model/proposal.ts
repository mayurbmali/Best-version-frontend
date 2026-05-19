import { Job } from './job';
import { User } from './user';
import { FreelancerProfile } from './freelancer-profile';

export interface Proposal {
  id?: number;
  title?: string;
  jobId?: number;
  bidAmount?: number;
  coverLetter?: string;
  status?: string;
  job?: Job;
  freelancer?: User;
  appliedAt?: string;
  freelancerProfile?: FreelancerProfile;
}
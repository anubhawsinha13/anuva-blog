import type { Metadata } from "next";
import data from "@/content/profile-public.json";
import ProfileView from "@/components/profile/ProfileView";
import type { ProfileContent } from "@/components/profile/types";
import "./profile.css";

const profile = data as ProfileContent;

export const metadata: Metadata = {
  title: "Profile",
  description: profile.shortBio,
  openGraph: {
    title: "Anubhaw Sinha",
    description: profile.shortBio,
    images: ["/profile/hero.png"],
  },
};

export default function ProfilePage() {
  return <ProfileView profile={profile} />;
}

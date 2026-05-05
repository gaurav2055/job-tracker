// This page acts as a redirect hub; the main job list lives on the Dashboard.
// Keeping it here so the sidebar "Jobs" link works and shows the same grid with
// the Add Job button pre-opened if the user navigates here directly.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Jobs() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/'); }, [navigate]);
  return null;
}

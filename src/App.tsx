import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { LegacyPage } from '@/pages/LegacyPage';
import { ObituaryPage } from '@/pages/ObituaryPage';
import { FuneralPage } from '@/pages/FuneralPage';
import { LivestreamPage } from '@/pages/LivestreamPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { SharePhotosPage } from '@/pages/SharePhotosPage';
import { MemoriesPage } from '@/pages/MemoriesPage';
import { TributesPage } from '@/pages/TributesPage';
import { FamilyPage } from '@/pages/FamilyPage';
import { DonationsPage } from '@/pages/DonationsPage';
import { AdminGuard } from '@/admin/AdminGuard';
import { AdminDashboard } from '@/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="legacy" element={<LegacyPage />} />
          <Route path="legacy/obituary" element={<ObituaryPage />} />
          <Route path="funeral" element={<FuneralPage />} />
          <Route path="funeral/livestream" element={<LivestreamPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="share-photos" element={<SharePhotosPage />} />
          <Route path="memories" element={<MemoriesPage />} />
          <Route path="tributes" element={<TributesPage />} />
          <Route path="family" element={<FamilyPage />} />
          <Route path="donations" element={<DonationsPage />} />
        </Route>
        <Route path="admin" element={<AdminGuard />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import MainLayout from '@/layouts/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Upload from '@/pages/Upload';
import AllProjects from '@/pages/AllProjects';
import ProjectDetails from '@/pages/ProjectDetails';
import EditProject from '@/pages/EditProject';
import Favorites from '@/pages/Favorites';
import WatchLater from '@/pages/WatchLater';
import About from '@/pages/About';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

/** Jump back to the top whenever the route changes. */
function ScrollRestoration() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Route table.
 * The page-transition animation lives in MainLayout so the sidebar and navbar
 * are not torn down and rebuilt on every navigation.
 */
export default function App() {
  return (
    <>
      <ScrollRestoration />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/project/:id/edit" element={<EditProject />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/watch-later" element={<WatchLater />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

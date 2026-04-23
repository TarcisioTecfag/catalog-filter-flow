import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AdminProvider } from "@/contexts/AdminContext";
import { IndustrialLinesProvider } from "@/contexts/IndustrialLinesContext";
import { AdminToggleButton } from "@/components/AdminLoginModal";
import Index from "./pages/Index";
import CatalogCategories from "./pages/CatalogCategories";
import CatalogMachines from "./pages/CatalogMachines";
import IndustrialLines from "./pages/IndustrialLines";
import LineDetail from "./pages/LineDetail";
import CreateLine from "./pages/CreateLine";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/catalogo" element={<CatalogCategories />} />
        <Route path="/catalogo/:categoryId" element={<CatalogMachines />} />
        <Route path="/linhas-industriais" element={<IndustrialLines />} />
        <Route path="/linhas-industriais/:lineId" element={<LineDetail />} />
        <Route path="/criar-linha" element={<CreateLine />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <IndustrialLinesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
            <AdminToggleButton />
          </BrowserRouter>
        </IndustrialLinesProvider>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

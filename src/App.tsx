import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CatalogCategories from "./pages/CatalogCategories";
import CatalogMachines from "./pages/CatalogMachines";
import IndustrialLines from "./pages/IndustrialLines";
import LineDetail from "./pages/LineDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/catalogo" element={<CatalogCategories />} />
          <Route path="/catalogo/:categoryId" element={<CatalogMachines />} />
          <Route path="/linhas-industriais" element={<IndustrialLines />} />
          <Route path="/linhas-industriais/:lineId" element={<LineDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

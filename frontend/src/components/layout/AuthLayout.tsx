// import { Outlet, useLocation } from "react-router-dom";
// import { AnimatePresence, motion } from "framer-motion";
// import { Sparkles } from "lucide-react";
// import { pageVariants } from "../../lib/motion";

// export default function AuthLayout() {
//   const location = useLocation();

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-bg px-4">
//       <div className="w-full max-w-md">
//         <div className="mb-8 flex items-center justify-center gap-2">
//           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
//             <Sparkles size={16} />
//           </div>
//           <span className="text-lg font-bold tracking-tight text-text-primary">RecoverAI</span>
//         </div>
//         <div className="rounded-2xl border border-bg-border bg-bg-surface p-8 shadow-card">
//           <AnimatePresence mode="wait">
//             <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
//               <Outlet />
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }












import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { pageVariants } from "../../lib/motion";

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-bg">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen w-full"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
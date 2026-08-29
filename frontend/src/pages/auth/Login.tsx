// import { FormEvent, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import Input from "../../components/common/Input";
// import Button from "../../components/common/Button";
// import { useToast } from "../../components/common/Toast";
// import { getErrorMessage } from "../../utils/errors";

// export default function Login() {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const { show } = useToast();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     if (!email || !password) {
//       setError("Email and password are required.");
//       return;
//     }
//     setLoading(true);
//     try {
//       await login(email, password);
//       show("Welcome back!", "success");
//       navigate("/dashboard");
//     } catch (err) {
//       setError(getErrorMessage(err, "Couldn't sign you in. Check your credentials."));
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//       <div>
//         <h1 className="text-lg font-semibold text-text-primary">Sign in</h1>
//         <p className="mt-1 text-sm text-text-muted">Welcome back to your recovery dashboard.</p>
//       </div>
//       <Input
//         label="Email"
//         type="email"
//         autoComplete="email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         placeholder="you@company.com"
//       />
//       <Input
//         label="Password"
//         type="password"
//         autoComplete="current-password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="••••••••"
//       />
//       {error && <p className="text-sm text-rose-600">{error}</p>}
//       <Button type="submit" loading={loading} className="mt-2 w-full">
//         Sign in
//       </Button>
//       <p className="text-center text-sm text-text-muted">
//         Don't have an account?{" "}
//         <Link to="/register" className="font-medium text-brand hover:text-brand-dark hover:underline">
//           Create one
//         </Link>
//       </p>
//     </form>
//   );
// }













import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { show } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      show("Welcome back!", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Couldn't sign you in. Check your credentials."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0b0d14] text-white">

      {/* =====================================================
          DESKTOP
      ===================================================== */}
      <div className="hidden lg:flex min-h-screen w-full">

        {/* LEFT SIDE */}
        <section className="relative flex w-[55%] min-h-screen overflow-hidden">

          {/* Background effects */}
          <div className="absolute -top-52 -left-52 h-[650px] w-[650px] rounded-full bg-indigo-600/20 blur-[150px]" />
          <div className="absolute -bottom-64 right-[-150px] h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[150px]" />

          <div className="relative z-10 flex w-full flex-col px-14 py-12 xl:px-20">

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 shadow-lg shadow-indigo-500/20">
                <span className="text-xl">✦</span>
              </div>

              <div>
                <div className="text-xl font-bold tracking-tight">
                  RecoverAI
                </div>

                <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/35">
                  Revenue Recovery
                </div>
              </div>

            </div>

            {/* Hero */}
            <div className="flex flex-1 items-center">

              <div className="max-w-[650px]">

                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.07] px-3 py-1.5 text-xs text-indigo-300">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />

                  AI-powered revenue recovery

                </div>

                <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.045em] xl:text-6xl">

                  Recover more revenue.

                  <br />

                  <span className="bg-gradient-to-r from-indigo-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                    Automatically.
                  </span>

                </h1>

                <p className="mt-7 max-w-xl text-base leading-7 text-white/40 xl:text-lg xl:leading-8">
                  RecoverAI helps modern businesses identify lost revenue,
                  predict customer risk, and intelligently recover every
                  possible payment.
                </p>

                {/* Stats */}
                <div className="mt-12 flex items-center gap-8 xl:gap-12">

                  <div>
                    <div className="text-2xl font-semibold">
                      AI
                    </div>
                    <div className="mt-1 text-xs text-white/30">
                      Intelligent recovery
                    </div>
                  </div>

                  <div className="h-10 w-px bg-white/10" />

                  <div>
                    <div className="text-2xl font-semibold">
                      24/7
                    </div>
                    <div className="mt-1 text-xs text-white/30">
                      Automated monitoring
                    </div>
                  </div>

                  <div className="h-10 w-px bg-white/10" />

                  <div>
                    <div className="text-2xl font-semibold">
                      Real-time
                    </div>
                    <div className="mt-1 text-xs text-white/30">
                      Recovery insights
                    </div>
                  </div>

                </div>

              </div>

            </div>

            <div className="text-xs text-white/20">
              Intelligent recovery infrastructure for modern businesses.
            </div>

          </div>
        </section>


        {/* RIGHT SIDE */}
        <section className="flex min-h-screen flex-1 items-center justify-center border-l border-white/[0.06] bg-[#0d0f17] px-8">

          <div className="w-full max-w-[420px]">

            {/* Heading */}
            <div className="mb-8">

              <h2 className="text-3xl font-semibold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Sign in to continue to your recovery dashboard.
              </p>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>

                <label className="mb-2 block text-xs font-medium text-white/60">
                  Email address
                </label>

                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-white/[0.10]
                    bg-white/[0.025]
                    px-4
                    text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-white/20
                    hover:border-white/[0.18]
                    focus:border-indigo-400
                    focus:ring-4
                    focus:ring-indigo-500/10
                  "
                />

              </div>


              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-xs font-medium text-white/60">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-[10px] text-white/25 transition hover:text-indigo-300"
                    onClick={() => {}}
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-white/[0.10]
                      bg-white/[0.025]
                      pl-4
                      pr-12
                      text-sm
                      text-white
                      outline-none
                      transition
                      placeholder:text-white/20
                      hover:border-white/[0.18]
                      focus:border-indigo-400
                      focus:ring-4
                      focus:ring-indigo-500/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute
                      right-3
                      top-1/2
                      flex
                      h-8
                      w-8
                      -translate-y-1/2
                      items-center
                      justify-center
                      text-white/30
                      transition
                      hover:text-white/70
                    "
                  >

                    {showPassword ? (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9.5 5 9.5 8s-4 8-9.5 8a10.8 10.8 0 0 1-4.3-.9" />
                        <path d="M6.6 6.6C4.1 8.2 2.5 10.7 2.5 12c0 1.1 1.4 3.4 3.5 5" />
                      </svg>
                    ) : (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}

                  </button>

                </div>

              </div>


              {/* Error */}
              {error && (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5 text-xs text-rose-400">
                  {error}
                </div>
              )}


              {/* Button */}
              <Button
                type="submit"
                loading={loading}
                className="
                  !mt-7
                  h-12
                  w-full
                  rounded-xl
                  !bg-indigo-500
                  shadow-lg
                  shadow-indigo-500/20
                  transition
                  hover:!bg-indigo-400
                "
              >
                Sign in
              </Button>

            </form>


            {/* Register */}
            <p className="mt-7 text-center text-xs text-white/35">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-medium text-indigo-300 transition hover:text-indigo-200"
              >
                Create one
              </Link>

            </p>


            {/* Security */}
            <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-white/20">

              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>

              Your data is securely encrypted

            </div>

          </div>

        </section>

      </div>


      {/* =====================================================
          MOBILE
      ===================================================== */}
      <div className="flex min-h-screen w-full items-center justify-center px-5 py-10 lg:hidden">

        <div className="w-full max-w-[430px]">

          {/* Logo */}
          <div className="mb-10 flex items-center justify-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600">
              <span className="text-lg">✦</span>
            </div>

            <span className="text-xl font-bold">
              RecoverAI
            </span>

          </div>


          <h2 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h2>

          <p className="mt-2 text-sm text-white/40">
            Sign in to continue to your recovery dashboard.
          </p>


          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            <div>

              <label className="mb-2 block text-xs font-medium text-white/60">
                Email address
              </label>

              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-white/[0.10]
                  bg-white/[0.025]
                  px-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/20
                  focus:border-indigo-400
                  focus:ring-4
                  focus:ring-indigo-500/10
                "
              />

            </div>


            <div>

              <div className="mb-2 flex items-center justify-between">

                <label className="text-xs font-medium text-white/60">
                  Password
                </label>

                <button
                  type="button"
                  className="text-[10px] text-white/25 hover:text-indigo-300"
                >
                  Forgot password?
                </button>

              </div>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-white/[0.10]
                    bg-white/[0.025]
                    px-4
                    pr-12
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/20
                    focus:border-indigo-400
                    focus:ring-4
                    focus:ring-indigo-500/10
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                >
                  {showPassword ? "◉" : "◌"}
                </button>

              </div>

            </div>


            {error && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5 text-xs text-rose-400">
                {error}
              </div>
            )}


            <Button
              type="submit"
              loading={loading}
              className="
                !mt-7
                h-12
                w-full
                rounded-xl
                !bg-indigo-500
                shadow-lg
                shadow-indigo-500/20
              "
            >
              Sign in
            </Button>

          </form>


          <p className="mt-7 text-center text-xs text-white/35">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-300"
            >
              Create one
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}
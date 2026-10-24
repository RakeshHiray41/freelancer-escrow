import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200">
            A marketplace where the client's money is held in escrow and released only when the milestone is approved.
          </p>
        </div>
        <nav aria-label="Product">
          <h3 className="text-sm font-bold text-white">Product</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a className="hover:text-white" href="/#how">How escrow works</a></li>
            <li><a className="hover:text-white" href="/#features">Features</a></li>
            <li><a className="hover:text-white" href="/#faq">Questions</a></li>
          </ul>
        </nav>
        <nav aria-label="Account">
          <h3 className="text-sm font-bold text-white">Account</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/login">Log in</Link></li>
            <li><Link className="hover:text-white" to="/register">Create account</Link></li>
            <li><Link className="hover:text-white" to="/forgot-password">Reset password</Link></li>
          </ul>
        </nav>
        <div>
          <h3 className="text-sm font-bold text-white">Fees</h3>
          <p className="mt-3 text-sm text-brand-200">5% platform fee, charged only when a milestone is paid out.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-brand-200">
        © {new Date().getFullYear()} EscrowHub. All rights reserved.
      </div>
    </footer>
  )
}

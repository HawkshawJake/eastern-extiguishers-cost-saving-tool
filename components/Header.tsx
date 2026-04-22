import Image from 'next/image'

interface HeaderProps {
  step?: number
  totalSteps?: number
}

export default function Header({ step, totalSteps = 3 }: HeaderProps) {
  return (
    <header className="bg-brand-red w-full">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-4">
        <Image
          src="/logo.webp"
          alt="Eastern Extinguishers"
          width={200}
          height={40}
          className="h-9 w-auto"
          priority
        />
        {step && (
          <span className="text-white/70 font-body text-sm tracking-wide">
            Step {step} of {totalSteps}
          </span>
        )}
      </div>
    </header>
  )
}

'use client'
import Image from 'next/image'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'
import { useCompanyName } from '@/hooks/useCompanyName'

const APP_LOGO_SRC = '/file.svg'

export default function Home() {
  const companyName = useCompanyName()
  return (
    <LayoutWithSidebar>
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Image src={APP_LOGO_SRC} alt="Nibisoft" width={128} height={128} priority />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">{companyName}</h1>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

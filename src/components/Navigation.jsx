import { Image } from '@nextui-org/react'
import React from 'react'

import agil from '../assets/logo.png'

function Navigation() {
  return (
    <div className='flex items-center justify-center'>
        <h2 className='text-2xl text-gray-400 font-bold tracking-tighter'>Creado por:</h2>
        <Image src={agil} width={200} className='mx-auto'/>
    </div>
  )
}

export default Navigation
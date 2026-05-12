import React from 'react'
import {Canvas} from '@react-three/fiber'
import {Environment, OrbitControls, Stage} from '@react-three/drei'
import { CameraControls, PerspectiveCamera} from '@react-three/drei'
import { Suspense } from 'react'
// @ts-ignore
import { Sonya7iii } from '../components/3dModel/Sonya7iii'



const home = () => {
  return (
    <div className="text-center max-w-full">
     <p className='image-text-black text-5xl md:text-7xl font-bold leading-tight drop-shadow-sm break-words'>Candle Light<br />Studio</p>

     <div className='border-2 h-[700px] my-5 rounded-md'>
      <Canvas>
        <PerspectiveCamera makeDefault fov={75} position={[0, 0, 5]} resolution={1024} />
        <CameraControls />
        <Suspense>
          <Sonya7iii/>
        </Suspense>
       
        <ambientLight intensity={5} />
        <Environment preset="city" />
      </Canvas>

     </div>
    </div>
  )
} 

export default home
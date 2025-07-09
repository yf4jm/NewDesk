import React from 'react'
import { Link } from 'react-router-dom'
const BackButton = () => {
  return (
    <Link to={"/"} className='text-blue-400 text-2xl'>&gt;home</Link>
  )
}

export default BackButton
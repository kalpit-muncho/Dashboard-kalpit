import React from 'react'

const Loading = () => {
  return (
    <div className='flex flex-col gap-4 justify-center items-center h-78 w-full'>
        <h1 className='text-xl font-medium animate-pulse'>loading</h1>
        <div className="flex flex-row gap-2">
            <div className="w-4 h-4 rounded-full bg-[#4B21E2] animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-[#4B21E2] animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-[#4B21E2] animate-bounce [animation-delay:-.5s]"></div>
        </div>
    </div>
  )
}

export default Loading;
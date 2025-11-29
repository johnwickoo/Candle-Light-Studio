import React from 'react'

interface ToastProps {
  message: string;
}

const Toast = ({ message }: ToastProps) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 height-auto w-auto z-50">
      {message}
    </div>
  )
}

export default Toast
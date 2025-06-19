import React from 'react'

function Header() {
  return (
    <header>
      <nav>
        <div className='grid grid-cols-12 ml-14 mr-14 mt-4 h-16 items-center'>
          <div className="col-span-4 w-40 hover:cursor-pointer">
            <img src='\images\caremagix-logo.jpg' />
          </div>
          <div className='col-span-5'>
            <ul className='flex justify-between items-center  text-gray-500 text-sm '>
              <li className='hover:cursor-pointer hover:text-black'>Our Plateform</li>
              <li className='hover:cursor-pointer hover:text-black'>Solutions</li>
              <li className='hover:cursor-pointer hover:text-black'>Other Benefits</li>
              <li className='flex items-center hover:cursor-pointer hover:text-black'>
                Patients
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                    <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clipRule="evenodd" />
                  </svg>
        
                </div>


              </li>
              <li className='bg-yellow-300 rounded-2xl py-2 px-4 hover:cursor-pointer hover:text-black'>Sign in</li>
            </ul>
          </div>
          <div className=" flex justify-end col-span-3 text-end  hover:cursor-pointer">
            <div className="flex items-center gap-0 py-4 px-6 bg-leafgreen-500 text-white rounded">
              <svg xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-4">
                <path d="M10.5 18.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
                <path fillRule="evenodd"
                  d="M8.625.75A3.375 3.375 0 0 0 5.25 4.125v15.75a3.375 3.375 0 0 0 3.375 3.375h6.75a3.375 3.375 0 0 0 3.375-3.375V4.125A3.375 3.375 0 0 0 15.375.75h-6.75ZM7.5 4.125C7.5 3.504 8.004 3 8.625 3H9.75v.375c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V3h1.125c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 0 1 7.5 19.875V4.125Z"
                  clipRule="evenodd" />
              </svg>
              Contact
            </div>
          </div>

        </div>
      </nav>
    </header>

  )
}

export default Header
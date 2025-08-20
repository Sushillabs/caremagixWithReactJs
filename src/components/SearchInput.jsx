import React from 'react'

const SearchInput = ({placeholder, value, onChange}) => {
  return (
     <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border bg-white border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}

export default React.memo(SearchInput)
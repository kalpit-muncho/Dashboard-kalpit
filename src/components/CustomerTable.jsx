import React from 'react';

const CustomerTable = ({ customers }) => {
  return (
    <div className="w-full overflow-auto max-h-[calc(100vh-142px)]">
      <table className="w-full table-fixed">
        <thead className='text-sm shadow-2xs text-[#323232] sticky top-0 bg-white z-20'>
          <tr>
            <th className="text-center px-4 py-3 w-1/6">Name</th>
            <th className="text-center px-4 py-3 w-1/6">Type</th>
            <th className="text-center px-4 py-3 w-1/6">Date</th>
            {/* <th className="text-center px-4 py-3 w-1/6">Transaction ID</th> */}
            <th className="text-center px-4 py-3 w-1/6">Amount</th>
            <th className="text-center px-4 py-3 w-1/6">Phone Number</th>
          </tr>
        </thead>
        <tbody className='overflow-x-auto'>
          {customers.map((customer) => (
            <tr key={customer.id} className="transition-colors duration-500 hover:bg-gray-100 text-sm">
              <td className="px-4 py-5 text-center text-[#727272] font-normal truncate">{customer.name}</td>
              <td className="px-4 py-5 text-center text-[#727272] font-normal truncate">{customer.type}</td>
              <td className="px-4 py-5 text-center text-[#727272] font-normal truncate">{customer.date}</td>
              {/* <td className="px-4 py-5 text-center text-[#727272] font-normal truncate">{customer.transactionId}</td> */}
              <td className="px-4 py-5 text-center text-[#727272] font-normal truncate">{customer.subTotal} ₹</td>
              <td className="px-4 py-5 text-center text-[#727272] font-normal truncate">{customer.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;

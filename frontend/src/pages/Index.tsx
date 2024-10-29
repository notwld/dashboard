import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Index() {
    const data = [
        {
          name: 'Jan',
          sales: 0,
          customers: 0,
          amt: 2400,
        },
        {
          name: 'Feb',
          sales: 0,
          customers: 0,
          amt: 2210,
        },
        {
          name: 'Mar',
          sales: 0,
          customers: 0,
          amt: 2290,
        },
        {
          name: 'Apr',
          sales: 0,
          customers: 0,
          amt: 2000,
        },
        {
          name: 'May',
          sales: 0,
          customers: 0,
          amt: 2181,
        },
        {
          name: 'Jun',
          sales: 0,
          customers: 0,
          amt: 2500,
        },
        {
          name: 'Jul',
          sales: 0,
          customers: 0,
          amt: 2100,
        },
        {
            name: 'Aug',
            sales: 0,
          customers: 0,
            amt: 2100,
        },
        {
            name: 'Sep',
            sales: 0,
          customers: 0,
            amt: 2100,
        },
        {
            name: 'Oct',
            sales: 3490,
            customers: 4300,
            amt: 2100,
        },
        {
            name: 'Nov',
            sales: 0,
          customers: 0,
            amt: 2100,
        },
        {
            name: 'Dec',
            sales: 0,
            customers: 0,
            amt: 2100,
        }
      ];
      
  return (
    <div className="flex h-screen w-screen justify-center items-center p-48">
        <ResponsiveContainer className="flex">
        <BarChart
          
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="customers" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          <Bar dataKey="sales" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

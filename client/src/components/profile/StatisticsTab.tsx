import { motion } from 'motion/react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Download, Star, TrendingUp } from 'lucide-react';

// Empty data arrays - to be filled from database
const viewsData: any[] = [];
const downloadsData: any[] = [];
const forumActivityData: any[] = [];
const reputationData: any[] = [];
const uploadsStats: any[] = [];

export function StatisticsTab() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Eye className="w-5 h-5" />
            </div>
            <span className="text-gray-600">צפיות פרופיל</span>
          </div>
          <div className="text-3xl text-blue-600">1,234</div>
          <p className="text-sm text-blue-600 mt-1">
            <TrendingUp className="w-3 h-3 inline ml-1" />
            +12% מהשבוע שעבר
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-600 text-white p-2 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-gray-600">הורדות השבוע</span>
          </div>
          <div className="text-3xl text-purple-600">89</div>
          <p className="text-sm text-purple-600 mt-1">
            <TrendingUp className="w-3 h-3 inline ml-1" />
            +8% מהשבוע שעבר
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-600 text-white p-2 rounded-lg">
              <Star className="w-5 h-5" />
            </div>
            <span className="text-gray-600">דירוג ממוצע</span>
          </div>
          <div className="text-3xl text-green-600">4.7 ⭐</div>
          <p className="text-sm text-green-600 mt-1">על כל הסיכומים</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-600 text-white p-2 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-gray-600">אחוז תגובה</span>
          </div>
          <div className="text-3xl text-orange-600">95%</div>
          <p className="text-sm text-orange-600 mt-1">בפורום Q&A</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-gray-900 mb-4">צפיות במשך 30 יום</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Downloads by Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-gray-900 mb-4">הורדות לפי סיכום (Top 5)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={downloadsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={0} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="downloads" fill="url(#colorGradient)" radius={[0, 8, 8, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Forum Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-gray-900 mb-4">פעילות בפורום (4 שבועות)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={forumActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="questions"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="answers"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">שאלות</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">תשובות</span>
            </div>
          </div>
        </motion.div>

        {/* Reputation Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-gray-900 mb-4">גידול במוניטין (6 חודשים)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={reputationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="reputation"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detailed Stats Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-gray-900 mb-4">סטטיסטיקות מפורטות - סיכומים</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-gray-600">סיכום</th>
                <th className="pb-3 text-gray-600 text-center">צפיות</th>
                <th className="pb-3 text-gray-600 text-center">הורדות</th>
                <th className="pb-3 text-gray-600 text-center">דירוג</th>
              </tr>
            </thead>
            <tbody>
              {uploadsStats.map((stat, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 text-gray-900">{stat.name}</td>
                  <td className="py-4 text-center text-gray-600">{stat.views}</td>
                  <td className="py-4 text-center text-gray-600">{stat.downloads}</td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-sm">
                      ⭐ {stat.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-gray-900 mb-4">סטטיסטיקות פורום</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">סך הכל שאלות</span>
              <span className="text-gray-900">12</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">סך הכל תשובות</span>
              <span className="text-gray-900">33</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-700">תשובות מקובלות</span>
              <span className="text-green-700">8</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">זמן תגובה ממוצע</span>
              <span className="text-gray-900">2.5 שעות</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700">הצבעות חיוביות</span>
              <span className="text-blue-700">145</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-gray-900 mb-4">מדדי מעורבות</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">צפיות בפרופיל</span>
              <span className="text-gray-900">1,234</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-700">עוקבים</span>
              <span className="text-purple-700">45</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">עוקב אחרי</span>
              <span className="text-gray-900">23</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">תגובות שהתקבלו</span>
              <span className="text-gray-900">89</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-700">שיתופים</span>
              <span className="text-blue-700">34</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

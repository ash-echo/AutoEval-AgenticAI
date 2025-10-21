import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, Award, PieChart, Activity, Calendar } from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:8000/analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto text-center py-20"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-xl text-gray-600">Loading analytics...</p>
      </motion.div>
    );
  }

  if (!analytics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center py-20"
      >
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Available</h2>
        <p className="text-gray-600">Complete some evaluations to see analytics data.</p>
      </motion.div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 opacity-80" />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-bold"
        >
          {value}
        </motion.div>
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
    </motion.div>
  );

  const SubjectBar = ({ subject, count, percentage, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-gray-900">{subject}</span>
        <span className="text-sm text-gray-600">{count} submissions</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
      </div>
    </motion.div>
  );

  const totalSubmissions = analytics.total_submissions || 0;
  const averageScore = analytics.average_score || 0;
  const subjectBreakdown = analytics.subject_breakdown || {};

  const maxSubjectCount = Math.max(...Object.values(subjectBreakdown), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">Performance insights and trends</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={Users}
          color="from-blue-500 to-blue-600"
          subtitle="Evaluations completed"
          delay={0.1}
        />

        <StatCard
          title="Average Score"
          value={averageScore.toFixed(1)}
          icon={Award}
          color="from-green-500 to-green-600"
          subtitle="Overall performance"
          delay={0.2}
        />

        <StatCard
          title="Active Subjects"
          value={Object.keys(subjectBreakdown).length}
          icon={BookOpen}
          color="from-purple-500 to-purple-600"
          subtitle="Different subjects"
          delay={0.3}
        />

        <StatCard
          title="Success Rate"
          value={averageScore >= 60 ? 'Good' : 'Needs Work'}
          icon={TrendingUp}
          color={averageScore >= 60 ? "from-emerald-500 to-emerald-600" : "from-orange-500 to-orange-600"}
          subtitle={`${averageScore.toFixed(1)}% average`}
          delay={0.4}
        />
      </div>

      {/* Subject Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
      >
        <div className="flex items-center mb-6">
          <PieChart className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Subject Distribution</h2>
        </div>

        {Object.keys(subjectBreakdown).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(subjectBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([subject, count], index) => (
                <SubjectBar
                  key={subject}
                  subject={subject}
                  count={count}
                  percentage={(count / totalSubmissions) * 100}
                  delay={0.1 * index}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Subject Data Yet</h3>
            <p className="text-gray-600">Complete evaluations with different subjects to see distribution.</p>
          </div>
        )}
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-indigo-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Performance Insights</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
              <span className="text-gray-700">Average Score</span>
              <span className={`font-bold ${averageScore >= 70 ? 'text-green-600' : averageScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {averageScore.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
              <span className="text-gray-700">Total Evaluations</span>
              <span className="font-bold text-blue-600">{totalSubmissions}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
              <span className="text-gray-700">Most Popular Subject</span>
              <span className="font-bold text-purple-600">
                {Object.entries(subjectBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Quick Stats</h3>
          </div>

          <div className="space-y-4">
            <div className="text-center p-6 bg-white/50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalSubmissions > 0 ? ((Object.values(subjectBreakdown).filter(count => count > 1).length / Object.keys(subjectBreakdown).length) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-gray-700">Subjects with Multiple Evaluations</div>
            </div>

            <div className="text-center p-6 bg-white/50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalSubmissions > 0 ? (averageScore / totalSubmissions * 10).toFixed(1) : 0}
              </div>
              <div className="text-gray-700">Avg Points per Evaluation</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
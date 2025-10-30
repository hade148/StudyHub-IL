import { motion } from 'motion/react';
import { Camera, Edit, Settings, MapPin, Building, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ProfileHeaderProps {
  user: {
    name: string;
    avatar: string;
    coverPhoto?: string;
    role: string;
    bio: string;
    location: string;
    institution: string;
    fieldOfStudy: string;
    joinDate: string;
    isOnline?: boolean;
  };
  onEditProfile?: () => void;
}

const roleColors: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  lecturer: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
};

const roleLabels: Record<string, string> = {
  student: 'סטודנט',
  lecturer: 'מרצה',
  admin: 'מנהל',
};

export function ProfileHeader({ user, onEditProfile }: ProfileHeaderProps) {
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('he-IL', { month: 'long' });
    const year = date.getFullYear();
    return `הצטרף ב${month} ${year}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Cover Image */}
      <div
        className="relative h-48 md:h-64"
        style={
          user.coverPhoto
            ? { backgroundImage: `url(${user.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
        }
      >
        {/* Action Buttons - Top Right */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Button
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
            onClick={onEditProfile}
          >
            <Edit className="w-4 h-4 ml-2" />
            ערוך פרופיל
          </Button>
          <Button
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            <Settings className="w-4 h-4 ml-2" />
            הגדרות
          </Button>
        </div>

        {/* Upload Cover Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm rounded-lg px-4 py-2 transition-all duration-200 flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          שנה תמונת רקע
        </motion.button>
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="relative -mt-16 md:-mt-20"
          >
            <div className="relative group">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white shadow-xl">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {/* Online Status Indicator */}
              {user.isOnline && (
                <div className="absolute bottom-2 left-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
              )}
              {/* Upload Avatar Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Camera className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* User Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex-1 space-y-3 pt-4 md:pt-0"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-gray-900">{user.name}</h1>
              <Badge className={roleColors[user.role] || roleColors.student}>
                {roleLabels[user.role] || roleLabels.student}
              </Badge>
            </div>

            <p className="text-gray-600 max-w-2xl">{user.bio}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>{user.institution}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>{user.fieldOfStudy}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{formatJoinDate(user.joinDate)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

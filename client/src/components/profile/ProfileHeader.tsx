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
      className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden"
    >
      {/* Cover Image */}
      <div
        className="relative h-40 md:h-48"
        style={
          user.coverPhoto
            ? { backgroundImage: `url(${user.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }
        }
      >
        {/* Action Buttons - Top Right */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Button
            variant="outline"
            className="bg-white/20 hover:bg-white/30 text-white border-white/40 backdrop-blur-md shadow-lg"
            onClick={onEditProfile}
          >
            <Edit className="w-4 h-4 ml-2" />
            ערוך
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="relative -mt-12 md:-mt-16"
          >
            <div className="relative group">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-2xl ring-4 ring-blue-100">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-3xl">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {/* Online Status Indicator */}
              {user.isOnline && (
                <div className="absolute bottom-1 left-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full shadow-lg" />
              )}
            </div>
          </motion.div>

          {/* User Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex-1 space-y-2 pt-4 md:pt-0"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="text-2xl font-bold bg-gradient-to-l from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{user.name}</h2>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 w-fit">
                {roleLabels[user.role] || roleLabels.student}
              </Badge>
            </div>

            {user.bio && <p className="text-sm text-gray-600 max-w-2xl">{user.bio}</p>}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 pt-1">
              {user.institution && (
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-blue-500" />
                  <span>{user.institution}</span>
                </div>
              )}
              {user.fieldOfStudy && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <span>{user.fieldOfStudy}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

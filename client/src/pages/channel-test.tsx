import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Channel {
  id: string;
  name: string;
  description: string;
  type: string;
  scope: string;
  schoolId?: string;
  classroomId?: string;
  familyId?: string;
}

function ChannelTest() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [message, setMessage] = useState('');

  const initializeNetworkChannels = async () => {
    try {
      const response = await apiRequest('/api/channels/initialize-network', {
        method: 'POST',
      });
      setMessage('Network channels initialized successfully');
      fetchChannels();
    } catch (error) {
      setMessage('Error initializing network channels');
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await apiRequest('/api/channels/my');
      setChannels(response);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // Expected network channels based on implementation
  const expectedNetworkChannels = [
    // Foundation channels
    'general',
    'foundation-ops',
    'foundation-mktgcomms', 
    'foundation-tech',
    'foundation-radicle',
    'foundation-chartergrowth',
    'foundation',
    'foundation-partners',
    'foundation-random',
    // Teacher channels
    'support-at',
    'new-to-wildflower',
    'cheers',
    'infants-and-toddlers',
    'primary',
    'lower-elementary',
    'upper-elementary',
    'adolescent',
    'wildflower-principles'
  ];

  const expectedSchoolChannels = [
    'wildrose',
    'wildrose-admin',
    'wildrose-staff',
    'wildrose-families',
    'wildrose-random',
    'wildrose-cheers'
  ];

  const expectedClassroomChannels = [
    'wildrose-primary',
    'wildrose-toddler',
    'wildrose-infant',
  ];

  const networkChannels = channels.filter(ch => ch.scope === 'network');
  const schoolChannels = channels.filter(ch => ch.scope === 'school');
  const classroomChannels = channels.filter(ch => ch.scope === 'classroom');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Channel Implementation Verification</h1>
      
      {message && (
        <div className="p-4 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={initializeNetworkChannels}>
          Initialize Network Channels
        </Button>
        <Button onClick={fetchChannels} variant="outline">
          Refresh Channels
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Channels ({networkChannels.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">Expected ({expectedNetworkChannels.length}):</h4>
              <ul className="text-sm space-y-1">
                {expectedNetworkChannels.map(name => (
                  <li 
                    key={name} 
                    className={networkChannels.some(ch => ch.name === name) ? 'text-green-600' : 'text-red-600'}
                  >
                    {networkChannels.some(ch => ch.name === name) ? '✓' : '✗'} {name}
                  </li>
                ))}
              </ul>
              
              <h4 className="font-semibold text-blue-700 mt-4">Actual:</h4>
              <ul className="text-sm space-y-1">
                {networkChannels.map(channel => (
                  <li key={channel.id} className="text-blue-600">
                    • {channel.name} ({channel.type})
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Channels ({schoolChannels.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">Expected ({expectedSchoolChannels.length}):</h4>
              <ul className="text-sm space-y-1">
                {expectedSchoolChannels.map(name => (
                  <li 
                    key={name} 
                    className={schoolChannels.some(ch => ch.name === name) ? 'text-green-600' : 'text-red-600'}
                  >
                    {schoolChannels.some(ch => ch.name === name) ? '✓' : '✗'} {name}
                  </li>
                ))}
              </ul>
              
              <h4 className="font-semibold text-blue-700 mt-4">Actual:</h4>
              <ul className="text-sm space-y-1">
                {schoolChannels.map(channel => (
                  <li key={channel.id} className="text-blue-600">
                    • {channel.name} ({channel.type})
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classroom Channels ({classroomChannels.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">Expected ({expectedClassroomChannels.length}):</h4>
              <ul className="text-sm space-y-1">
                {expectedClassroomChannels.map(name => (
                  <li 
                    key={name} 
                    className={classroomChannels.some(ch => ch.name === name) ? 'text-green-600' : 'text-red-600'}
                  >
                    {classroomChannels.some(ch => ch.name === name) ? '✓' : '✗'} {name}
                  </li>
                ))}
              </ul>
              
              <h4 className="font-semibold text-blue-700 mt-4">Actual:</h4>
              <ul className="text-sm space-y-1">
                {classroomChannels.map(channel => (
                  <li key={channel.id} className="text-blue-600">
                    • {channel.name} ({channel.type})
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Implementation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Network Foundation Channels (9):</h4>
              <p className="text-sm text-gray-600">general, foundation-ops, foundation-mktgcomms, foundation-tech, foundation-radicle, foundation-chartergrowth, foundation, foundation-partners, foundation-random</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Network Teacher Channels (9):</h4>
              <p className="text-sm text-gray-600">support-at, new-to-wildflower, cheers, infants-and-toddlers, primary, lower-elementary, upper-elementary, adolescent, wildflower-principles</p>
            </div>
            
            <div>
              <h4 className="font-semibold">School-Specific Channels (6):</h4>
              <p className="text-sm text-gray-600">wildrose, wildrose-admin, wildrose-staff, wildrose-families, wildrose-random, wildrose-cheers</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Classroom Channels (1 per classroom):</h4>
              <p className="text-sm text-gray-600">msgDisplayName-ageLevel format (e.g., wildrose-primary, wildrose-toddler)</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Family Channels:</h4>
              <p className="text-sm text-gray-600">Auto-generated with pattern: schoolname-families-lastname-firstname-firstname (e.g., wildrose-families-chenbobjane)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChannelTest;
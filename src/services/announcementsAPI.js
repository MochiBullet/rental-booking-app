// DynamoDB API URLs
const API_BASE_URL = 'https://ub3o5hhdz5.execute-api.ap-southeast-2.amazonaws.com/prod';

class AnnouncementsAPI {
  constructor() {
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // 全てのお知らせを取得
  async getAllAnnouncements() {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        announcements: data.announcements || []
      };
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      return {
        success: false,
        announcements: [],
        error: error.message
      };
    }
  }

  // 公開中のお知らせのみ取得
  async getPublishedAnnouncements() {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements?published=true`, {
        method: 'GET',
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        announcements: data.announcements || []
      };
    } catch (error) {
      console.error('Failed to fetch published announcements:', error);
      return {
        success: false,
        announcements: [],
        error: error.message
      };
    }
  }

  // お知らせを作成
  async createAnnouncement(announcement) {
    try {
      const announcementData = {
        id: Date.now().toString(),
        title: announcement.title,
        content: announcement.content || '',
        date: announcement.date || new Date().toISOString().split('T')[0],
        published: announcement.published !== undefined ? announcement.published : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(announcementData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        announcement: data.announcement || announcementData
      };
    } catch (error) {
      console.error('Failed to create announcement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // お知らせを更新
  async updateAnnouncement(id, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        announcement: data.announcement
      };
    } catch (error) {
      console.error('Failed to update announcement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // お知らせを削除
  async deleteAnnouncement(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // お知らせの公開/非公開を切り替え
  async togglePublished(id, published) {
    return this.updateAnnouncement(id, { published });
  }
}

export const announcementsAPI = new AnnouncementsAPI();
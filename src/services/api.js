// API service functions for backend communication

// Force cache refresh
console.log('API service RELOADED at:', new Date().toISOString())

const API_BASE = '/api'

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Store auth in localStorage
      localStorage.setItem('auth_logged_in', 'true')
      localStorage.setItem('username', data.user.username)
      return data
    } else {
      throw new Error(data.error || 'Login failed')
    }
  }
}

// Candidates API
export const candidatesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/candidates`)
    const data = await response.json()
    
    if (data.success) {
      return data.data
    } else {
      throw new Error(data.error || 'Failed to fetch candidates')
    }
  },
  
  create: async (candidateData) => {
    const response = await fetch(`${API_BASE}/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData),
    })
    
    const data = await response.json()
    
    if (data.success) {
      return data.data
    } else {
      throw new Error(data.error || 'Failed to create candidate')
    }
  },
  
  update: async (id, candidateData) => {
    const response = await fetch(`${API_BASE}/candidates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData),
    })
    
    const data = await response.json()
    
    if (data.success) {
      return data.data
    } else {
      throw new Error(data.error || 'Failed to update candidate')
    }
  },
  
  // Completely new delete function
  deleteCandidate: async (id) => {
    console.log('NEW DELETE FUNCTION - ID:', id, 'Type:', typeof id)
    
    // Force relative URL
    const url = `/api/candidates/${id}`
    console.log('NEW DELETE URL:', url)
    
    const response = await fetch(url, {
      method: 'DELETE',
    })
    
    console.log('NEW DELETE RESPONSE STATUS:', response.status)
    
    const data = await response.json()
    console.log('NEW DELETE RESPONSE DATA:', data)
    
    if (data.success) {
      return data.data
    } else {
      throw new Error(data.error || 'Failed to delete candidate')
    }
  },

  // Keep old delete function for compatibility
  delete: async (id) => {
    console.log('OLD DELETE FUNCTION CALLED - delegating to new function')
    return await candidatesAPI.deleteCandidate(id)
  },

  // Get candidate by ID
  getById: async (id) => {
    console.log('GET CANDIDATE BY ID:', id)
    
    const response = await fetch(`/api/candidates/${id}`)
    console.log('GET BY ID RESPONSE STATUS:', response.status)
    
    const data = await response.json()
    console.log('GET BY ID RESPONSE DATA:', data)
    
    if (data.success) {
      return data.data
    } else {
      throw new Error(data.error || 'Failed to fetch candidate')
    }
  },

  // Update candidate
  update: async (id, candidateData) => {
    console.log('UPDATE CANDIDATE - ID:', id)
    console.log('UPDATE CANDIDATE - DATA:', candidateData)
    
    const response = await fetch(`/api/candidates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData),
    })
    
    console.log('UPDATE RESPONSE STATUS:', response.status)
    
    const data = await response.json()
    console.log('UPDATE RESPONSE DATA:', data)
    
    if (data.success) {
      return data.data
    } else {
      throw new Error(data.error || 'Failed to update candidate')
    }
  }
}

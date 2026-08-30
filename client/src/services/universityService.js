const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const universityService = {
  // ─── Legacy generic handlers ────────────────────────────────────────────────
  async getFaculties() {
    const response = await fetch(`${API_URL}/university/faculties`);
    if (!response.ok) throw new Error('Failed to fetch faculties');
    return response.json();
  },

  async getPrograms(facultyId = '') {
    const url = new URL(`${API_URL}/university/programs`);
    if (facultyId) url.searchParams.append('facultyId', facultyId);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch programs');
    return response.json();
  },

  async getModules(programId, year, semester) {
    if (!programId || !year || !semester) return [];
    const url = new URL(`${API_URL}/university/modules`);
    url.searchParams.append('programId', programId);
    url.searchParams.append('year', year);
    url.searchParams.append('semester', semester);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch modules');
    return response.json();
  },

  // ─── IPAM-specific handlers ─────────────────────────────────────────────────

  /** Returns all 5 IPAM faculties with live programme counts. */
  async getIpamFaculties() {
    const response = await fetch(`${API_URL}/university/ipam/faculties`);
    if (!response.ok) throw new Error('Failed to fetch IPAM faculties');
    return response.json();
  },

  /** Returns departments, optionally filtered by faculty ID. */
  async getIpamDepartments(facultyId = '') {
    const url = new URL(`${API_URL}/university/ipam/departments`);
    if (facultyId) url.searchParams.append('facultyId', facultyId);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch IPAM departments');
    return response.json();
  },

  /**
   * Returns programmes, optionally filtered by faculty, level, and search.
   * @param {{ facultyId?: string, level?: string, search?: string }} opts
   */
  async getIpamPrograms({ facultyId = '', level = '', search = '' } = {}) {
    const url = new URL(`${API_URL}/university/ipam/programs`);
    if (facultyId) url.searchParams.append('facultyId', facultyId);
    if (level) url.searchParams.append('level', level);
    if (search) url.searchParams.append('search', search);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch IPAM programs');
    return response.json();
  },

  /** Returns a single programme with full detail by ID. */
  async getIpamProgramById(programId) {
    const response = await fetch(`${API_URL}/university/ipam/programs/${programId}`);
    if (!response.ok) throw new Error('Failed to fetch IPAM program');
    return response.json();
  }
};

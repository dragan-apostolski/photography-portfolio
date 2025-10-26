export const useProjectLoader = () => {
  const getLoadedProjects = (): Set<string> => {
    if (import.meta.client && typeof window !== 'undefined') {
      try {
        const loaded = sessionStorage.getItem('loaded-projects')
        return loaded ? new Set(JSON.parse(loaded)) : new Set()
      } catch {
        return new Set()
      }
    }
    return new Set()
  }

  const markProjectAsLoaded = (slug: string) => {
    if (import.meta.client && typeof window !== 'undefined') {
      try {
        const loadedProjects = getLoadedProjects()
        loadedProjects.add(slug)
        sessionStorage.setItem('loaded-projects', JSON.stringify(Array.from(loadedProjects)))
      } catch {
        // Handle sessionStorage errors gracefully
      }
    }
  }

  const shouldShowLoader = (slug: string): boolean => {
    // On server, always return true to avoid hydration mismatch
    if (!import.meta.client || typeof window === 'undefined') {
      return true
    }
    
    // On client, check sessionStorage
    const loadedProjects = getLoadedProjects()
    return !loadedProjects.has(slug)
  }

  return {
    getLoadedProjects,
    markProjectAsLoaded,
    shouldShowLoader,
  }
}


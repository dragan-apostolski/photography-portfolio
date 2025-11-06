import type { Project } from '~/types/project'

export const useProjectDate = () => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatProjectDate = (project: Project): string => {
    if (project.startDate && project.endDate) {
      const start = new Date(project.startDate)
      const end = new Date(project.endDate)
      
      if (start.getFullYear() === end.getFullYear()) {
        if (start.getMonth() === end.getMonth()) {
          const month = start.toLocaleDateString('en-US', { month: 'long' })
          const startDay = start.toLocaleDateString('en-US', { day: 'numeric' })
          const endDay = end.toLocaleDateString('en-US', { day: 'numeric' })
          const year = end.toLocaleDateString('en-US', { year: 'numeric' })
          return `${month} ${startDay} - ${endDay}, ${year}`
        }
        
        const startFormatted = start.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        })
        const endFormatted = end.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        return `${startFormatted} - ${endFormatted}`
      }
      
      return `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`
    }
    
    return project.date ? formatDate(project.date) : (project.startDate ? formatDate(project.startDate) : '')
  }

  const getDateTimeAttr = (project: Project): string => {
    return project.endDate || project.date || project.startDate || ''
  }

  return {
    formatProjectDate,
    getDateTimeAttr,
  }
}


'use client'
import { createContext, useContext, useState, useEffect } from 'react'

interface Fact {
    id: string
    claim: string
    answer: string
  }
  
  interface FactsContextType {
    facts: Fact[]
    addFact: (fact: Omit<Fact, 'id'>) => void
    deleteFact: (id: string) => void
  }

const FactsContext = createContext<FactsContextType | undefined>(undefined)

export function FactsProvider({ children }: { children: React.ReactNode }) {
  const [facts, setFacts] = useState<Fact[]>([])
  
  useEffect(() => {
    // Load facts from localStorage on mount
    const savedFacts = localStorage.getItem('facts')
    if (savedFacts) {
      setFacts(JSON.parse(savedFacts))
    }
  }, [])

  const addFact = (fact: Omit<Fact, 'id'>) => {
    const newFact = {
      ...fact,
      id: crypto.randomUUID()
    }
    const updatedFacts = [...facts, newFact]
    setFacts(updatedFacts)
    localStorage.setItem('facts', JSON.stringify(updatedFacts))
  }

  const deleteFact = (id: string) => {
    const updatedFacts = facts.filter(fact => fact.id !== id)
    setFacts(updatedFacts)
    localStorage.setItem('facts', JSON.stringify(updatedFacts))
  }

  return (
    <FactsContext.Provider value={{ facts, addFact, deleteFact }}>
      {children}
    </FactsContext.Provider>
  )
}

export function useFacts() {
  const context = useContext(FactsContext)
  if (context === undefined) {
    throw new Error('useFacts must be used within a FactsProvider')
  }
  return context
}
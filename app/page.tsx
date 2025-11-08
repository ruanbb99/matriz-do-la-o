"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import type React from "react"

import { User, Trash2, MoreVertical, Search, X, Check, Eye, EyeOff, Plus, Pencil } from "lucide-react"

interface UserType {
  id: number
  name: string
  entity: string
  lives: number
  lineNumber: number
  force?: "A" | "B" | "C" // Added optional force property
}

interface ConfirmationModal {
  show: boolean
  userName: string
  userEntity: string
  onConfirm: () => void
  onCancel: () => void
}

interface Score {
  number: number
  color: "green" | "red"
}

interface CategoryScores {
  [category: string]: { [key: string]: Score }
}

interface CategoryPosition {
  [category: string]: { lineNumber: number; squareIndex: 0 }
}

interface CategoryUsers {
  [category: string]: UserType[]
}

interface CategoryCounter {
  [category: string]: number
}

interface ForceConfig {
  voltas: number
  mataMata: number
}

interface CategoryForceConfig {
  [category: string]: {
    A: ForceConfig
    B: ForceConfig
    C: ForceConfig
    DEnabled?: boolean // Added DEnabled
    CEnabled: boolean
  }
}

interface CategoryForceUsers {
  [category: string]: {
    A: UserType[]
    B: UserType[]
    C: UserType[]
    D?: UserType[] // Added D
    trash: UserType[]
  }
}

interface CategoryUsedPositions {
  [category: string]: Set<number>
}

export default function HomePage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null)
  const [showRodeios, setShowRodeios] = useState(false)
  const [showPasswordScreen, setShowPasswordScreen] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [selectedRodeio, setSelectedRodeio] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [newUserEntity, setNewUserEntity] = useState("")
  const [newUserForce, setNewUserForce] = useState("")
  const [forceSelectionEnabled, setForceSelectionEnabled] = useState(false)

  const [isModalityConfigured, setIsModalityConfigured] = useState(false)

  const [groupSize, setGroupSize] = useState<0 | 10 | 20>(0) // 0 means all users, 10 and 20 are group sizes

  const [categoryUsers, setCategoryUsers] = useState<CategoryUsers>({})
  const [currentCategory, setCurrentCategory] = useState("INDIVIDUAL")
  const [categories, setCategories] = useState([
    "INDIVIDUAL",
    "FILIADOS",
    "PATRÃO DE PIQUETE",
    "GURI",
    "PATRÃO DA CAMPEIRA E CAPATAZ",
    "PRENDA MIRIM",
    "PRENDA JUVENIL",
    "PRENDA ADULTA",
    "QUARTETO",
    "SELEÇÃO",
    "COORDENADOR E EX-COORDENADOR",
    "VETERANO",
    "VAQUEANO",
    "PATRÃO DO CTG",
    "PATRÃO DA CAMPEIRA",
    "PAI E FILHO ATÉ 12",
    "PAI E FILHO ACIMA DE 12",
    "PAI E FILHA ATÉ 12",
    "PAI E FILHA ACIMA DE 12",
    "AVÔ E NETO",
  ])
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [highlightedUserId, setHighlightedUserId] = useState<number | null>(null)
  const [showAllLines, setShowAllLines] = useState(true)
  const [editingLine, setEditingLine] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<"name" | "entity" | "force" | null>(null)
  const [tempName, setTempName] = useState("")
  const [tempEntity, setTempEntity] = useState("")
  const [tempForce, setTempForce] = useState("")
  const userRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  // Function to simulate useScrollOffset hook behavior
  const useScrollOffset = () => {
    const [scrollOffset, setScrollOffset] = useState(0)

    useEffect(() => {
      const handleScroll = () => {
        setScrollOffset(window.scrollY)
      }
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return scrollOffset
  }

  const scrollOffset = useScrollOffset()
  const containerRef = useRef<HTMLDivElement>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const rodeiosRef = useRef<HTMLDivElement>(null)
  // Removed squareContextMenuRef and forceContextMenuRef as they are not used for state management
  const [squareContextMenu, setSquareContextMenu] = useState<{ show: boolean; x: number; y: number }>({
    show: false,
    x: 0,
    y: 0,
  })
  const [forceContextMenu, setForceContextMenu] = useState<{
    show: boolean
    x: number
    y: number
    force: "A" | "B" | "C" | null
  }>({
    show: false,
    x: 0,
    y: 0,
    force: null,
  })

  const [classificationText, setClassificationText] = useState("3 VOLTAS MAIS 5 DE MATA-MATA")
  const [isEditingClassification, setIsEditingClassification] = useState(false)
  const [tempClassificationText, setTempClassificationText] = useState("")

  const [categoryAText, setCategoryAText] = useState("11 e 12")
  const [categoryBText, setCategoryBText] = useState("9 e 10")
  const [categoryCText, setCategoryCText] = useState("7 e 8")
  const [editingCategory, setEditingCategory] = useState<"A" | "B" | "C" | null>(null)
  const [tempCategoryText, setTempCategoryText] = useState("")

  // Add state for category titles and info
  const [categoryTitles, setCategoryTitles] = useState<{ [key: string]: string }>({})
  const [categoryInfo, setCategoryInfo] = useState<{ [key: string]: { A: string; B: string; C: string; D?: string } }>(
    {},
  )

  const [squareInputValue, setSquareInputValue] = useState("")
  const squareInputRef = useRef<HTMLInputElement>(null)

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModal>({
    show: false,
    userName: "",
    userEntity: "",
    onConfirm: () => {},
    onCancel: () => {},
  })

  const [categoryScores, setCategoryScores] = useState<CategoryScores>({})
  const [categoryPositions, setCategoryPositions] = useState<CategoryPosition>({})

  const [categoryForceConfig, setCategoryForceConfig] = useState<CategoryForceConfig>({})
  const [categoryForceUsers, setCategoryForceUsers] = useState<CategoryForceUsers>({})
  const [forceInputValue, setForceInputValue] = useState("")
  const forceInputRef = useRef<HTMLInputElement>(null)
  const addUserForceInputRef = useRef<HTMLInputElement>(null)

  const [showForceUsersModal, setShowForceUsersModal] = useState<{
    show: boolean
    force: "A" | "B" | "C" | null
  }>({
    show: false,
    force: null,
  })
  const [selectedForceHighlight, setSelectedForceHighlight] = useState<"A" | "B" | "C" | null>(null)
  const [activeForceView, setActiveForceView] = useState<"A" | "B" | "C" | "trash" | null>(null)

  const [categoryUsedPositions, setCategoryUsedPositions] = useState<CategoryUsedPositions>({})

  const [editingSquare, setEditingSquare] = useState<{ lineNumber: number; squareIndex: number } | null>(null)

  const [showModalityEditor, setShowModalityEditor] = useState(false)
  const [editorStep, setEditorStep] = useState(1)
  const [modalityConfig, setModalityConfig] = useState({
    name: "",
    classificationText: "3 VOLTAS + 5 DE MATA-MATA",
    forcesEnabled: { A: true, B: true, C: true, D: false },
    forceRequirements: {
      A: 3,
      B: 2,
      C: 1,
      D: 0,
    },
    errorRules: {
      allowedRound: 0, // 0 = none, 1 = first, 2 = second, -1 = any
    },
  })

  const users = categoryUsers[currentCategory] || []
  const totalSquares = 30 // Assuming a fixed number of squares

  const getCurrentScores = () => categoryScores[currentCategory] || {}
  const getCurrentPosition = () => categoryPositions[currentCategory] || { lineNumber: 1, squareIndex: 0 }

  const setUsers = (newUsers: UserType[] | ((prev: UserType[]) => UserType[])) => {
    setCategoryUsers((prev) => ({
      ...prev,
      [currentCategory]: typeof newUsers === "function" ? newUsers(prev[currentCategory] || []) : newUsers,
    }))
  }

  const userOptions = ["Narrador", "Juiz", "Laçador", "outros"]

  const rodeioEvents = [
    { name: "CTG Querência Praiana", image: "/ctg-querencia-praiana.png" },
    { name: "Símbolo Cavera", image: "/cinbulocavera.png" },
    { name: "Símbolo Porteira Catarinense", image: "/cinbuloporteiracatarinense.png" },
    { name: "CTG do Preto", image: "/ctg-do-preto.png" },
    { name: "CTG Jaguaruna", image: "/ctg-jaguaruna.png" },
    { name: "CTG Estância 25", image: "/ctg-estancia-25.png" },
    { name: "Arena Rio Jordão", image: "/arena-rio-jordao.png" },
    { name: "CTG Herança do Velho Pai", image: "/ctg-heranca-do-velho-pai.png" },
    { name: "CTG Pedro Raymundo", image: "/ctg-pedro-raymundo.png" },
    { name: "CTG Beira Rio", image: "/ctg-beira-rio.png" },
    { name: "CTG Galpão de Estância", image: "/ctg-galpao-de-estancia.png" },
    { name: "CTG Porteira do Faxinal", image: "/ctg-porteira-do-faxinal.png" },
    { name: "CTG 13 Guapos", image: "/ctg-13-guapos.png" },
    { name: "CTG Tropeiros da Serração", image: "/ctg-tropeiros-da-serracao.png" },
    { name: "CTG Fronteira da Serra", image: "/ctg-fronteira-da-serra.png" },
    { name: "CTG Lago Azul", image: "/ctg-lago-azul.png" },
    { name: "CTG Cidade Amiga", image: "/ctg-cidade-amiga.png" },
    { name: "CTG Tio Chico", image: "/ctg-tio-chico.png" },
    { name: "CTG Orleanense", image: "/ctg-orleanense.png" },
    { name: "CTG Estância do Vale", image: "/ctg-estancia-do-vale.png" },
    { name: "CTG Vizinhos do Rio Grande", image: "/ctg-vizinhos-do-rio-grande.png" },
    { name: "CTG Cidade Azul", image: "/ctg-cidade-azul.png" },
    { name: "CTG Presilha Sombriense", image: "/ctg-presilha-sombriense.png" },
    { name: "CTG Vale da Amizade", image: "/ctg-vale-da-amizade.png" },
    { name: "CTG Querência de Galpão", image: "/ctg-querencia-de-galpao.png" },
    { name: "CTG Sul Catarinense", image: "/ctg-sul-catarinense.png" },
  ]

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentCategory(e.target.value)
    setSearchTerm("")
    setHighlightedUserId(null)
    setEditingLine(null)
    setEditingField(null)
    // Reset force counts and configs for the new category
    const initialConfig: CategoryForceConfig = {
      [e.target.value]: {
        A: { voltas: 3, mataMata: 5 },
        B: { voltas: 3, mataMata: 5 },
        C: { voltas: 3, mataMata: 5 },
        CEnabled: true,
      },
    }
    setCategoryForceConfig((prev) => ({ ...prev, ...initialConfig }))
    setCategoryForceUsers((prev) => ({ ...prev, [e.target.value]: { A: [], B: [], C: [], trash: [] } }))
    setActiveForceView(null) // Reset active view when changing category
    // Reset used positions for the new category
    setCategoryUsedPositions((prev) => ({ ...prev, [e.target.value]: new Set() }))
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const upperCaseName = newCategoryName.trim().toUpperCase()
      if (!categories.includes(upperCaseName)) {
        setCategories([...categories, upperCaseName])
        setCurrentCategory(upperCaseName)
        setNewCategoryName("")
        setShowAddCategoryModal(false)
        // Initialize used positions for the new category
        setCategoryUsedPositions((prev) => ({ ...prev, [upperCaseName]: new Set() }))
      } else {
        alert("Esta categoria já existe!")
      }
    }
  }

  const parseClassification = (text: string): { voltas: number; mataMata: number; total: number } => {
    const upperText = text.toUpperCase()
    const voltasMatch = upperText.match(/(\d+)\s*VOLTA/)
    const mataMataMatch = upperText.match(/(\d+)\s*(?:DE\s*)?MATA[-\s]*MATA/)

    const voltas = voltasMatch ? Number.parseInt(voltasMatch[1]) : 3
    const mataMata = mataMataMatch ? Number.parseInt(mataMataMatch[1]) : 5

    return { voltas, mataMata, total: voltas + mataMata }
  }

  // Added useCallback hook and dependencies
  const checkForceClassification = useCallback(
    (lineNumber: number, scores: { [key: string]: Score }) => {
      const config = categoryForceConfig[currentCategory]
      if (!config) return null

      const forceA = config.A || { voltas: 3, mataMata: 5 }
      const forceB = config.B || { voltas: 3, mataMata: 5 }
      const forceC = config.C || { voltas: 3, mataMata: 5 }
      const cEnabled = config.CEnabled ?? true

      const maxVoltas = Math.max(forceA.voltas, forceB.voltas, forceC.voltas)
      const maxMataMata = Math.max(forceA.mataMata, forceB.mataMata, forceC.mataMata)

      // Count correct answers in classification (voltas) and mata-mata
      let voltasCorrect = 0
      let voltasTotal = 0
      let mataMataCorrect = 0
      let mataMataTotal = 0

      for (let i = 0; i < maxVoltas; i++) {
        const key = `${lineNumber}-${i}`
        if (scores[key]) {
          voltasTotal++
          if (scores[key].color === "green") {
            voltasCorrect++
          }
        }
      }

      for (let i = maxVoltas; i < maxVoltas + maxMataMata; i++) {
        const key = `${lineNumber}-${i}`
        if (scores[key]) {
          mataMataTotal++
          if (scores[key].color === "green") {
            mataMataCorrect++
          }
        }
      }

      if (voltasTotal < maxVoltas || mataMataTotal < maxMataMata) {
        return null
      }

      const user = users.find((u) => u.lineNumber === lineNumber)
      if (user?.force) {
        const chosenForce = user.force
        let requiredConfig: ForceConfig

        if (chosenForce === "A") {
          requiredConfig = forceA
        } else if (chosenForce === "B") {
          requiredConfig = forceB
        } else if (chosenForce === "C") {
          requiredConfig = forceC
        } else {
          return null
        }

        // Check if user meets their chosen force requirements
        if (voltasCorrect >= requiredConfig.voltas && mataMataCorrect >= requiredConfig.mataMata) {
          return chosenForce
        } else {
          // User doesn't meet their chosen force requirements - send to trash
          return "trash"
        }
      }

      if (voltasCorrect >= forceA.voltas && mataMataCorrect >= forceA.mataMata) {
        return "A"
      }

      if (voltasCorrect >= forceB.voltas && mataMataCorrect >= forceB.mataMata) {
        return "B"
      }

      if (cEnabled && voltasCorrect >= forceC.voltas && mataMataCorrect >= forceC.mataMata) {
        return "C"
      }

      return "trash"
    },
    [categoryForceConfig, currentCategory, users],
  )

  const moveUserToForce = useCallback(
    (user: UserType, force: "A" | "B" | "C" | "trash") => {
      setCategoryForceUsers((prev) => {
        const current = prev[currentCategory] || { A: [], B: [], C: [], trash: [] }

        // Remove from all forces first
        const newA = current.A.filter((u) => u.id !== user.id)
        const newB = current.B.filter((u) => u.id !== user.id)
        const newC = current.C.filter((u) => u.id !== user.id)
        const newTrash = current.trash.filter((u) => u.id !== user.id)

        // Add to target force
        if (force === "A") {
          newA.push(user)
        } else if (force === "B") {
          newB.push(user)
        } else if (force === "C") {
          newC.push(user)
        } else {
          newTrash.push(user)
        }

        return {
          ...prev,
          [currentCategory]: {
            A: newA,
            B: newB,
            C: newC,
            trash: newTrash,
          },
        }
      })

      // Remove from main user list
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    },
    [currentCategory],
  )

  const recoverUserFromTrashToForce = useCallback(
    (user: UserType, force: "A" | "B" | "C") => {
      setCategoryForceUsers((prev) => {
        const current = prev[currentCategory] || { A: [], B: [], C: [], trash: [] }

        // Remove from trash
        const newTrash = current.trash.filter((u) => u.id !== user.id)

        // Add to target force
        const newA = force === "A" ? [...current.A, user] : current.A
        const newB = force === "B" ? [...current.B, user] : current.B
        const newC = force === "C" ? [...current.C, user] : current.C

        return {
          ...prev,
          [currentCategory]: {
            A: newA,
            B: newB,
            C: newC,
            trash: newTrash,
          },
        }
      })
    },
    [currentCategory],
  )

  const generateLines = useCallback(() => {
    const lines: UserType[] = []
    const maxLine = Math.max(...users.map((u) => u.lineNumber), 50)

    for (let i = 1; i <= maxLine; i++) {
      const user = users.find((u) => u.lineNumber === i)
      if (user) {
        lines.push(user)
      } else {
        lines.push({
          id: -i,
          name: "",
          entity: "",
          lives: 0,
          lineNumber: i,
        })
      }
    }
    return lines
  }, [users])

  const getDisplayLines = () => {
    if (activeForceView === "trash") {
      const forceUsers = categoryForceUsers[currentCategory]
      const trashUsers = forceUsers?.trash || []
      return trashUsers.sort((a, b) => a.lineNumber - b.lineNumber)
    }

    if (activeForceView) {
      const forceUsers = categoryForceUsers[currentCategory]?.[activeForceView] || []
      return forceUsers.sort((a, b) => a.lineNumber - b.lineNumber)
    }

    const forceUsers = categoryForceUsers[currentCategory]
    const classifiedUserIds = new Set([
      ...(forceUsers?.A || []).map((u) => u.id),
      ...(forceUsers?.B || []).map((u) => u.id),
      ...(forceUsers?.C || []).map((u) => u.id),
      ...(forceUsers?.trash || []).map((u) => u.id),
    ])

    const unclassifiedUsers = users.filter((u) => !classifiedUserIds.has(u.id))

    if (searchTerm && highlightedUserId) {
      const searchTermLower = searchTerm.toLowerCase()
      const matchingUsers = unclassifiedUsers.filter((user) => user.name.toLowerCase().includes(searchTermLower))

      if (matchingUsers.length > 1) {
        return matchingUsers.sort((a, b) => a.lineNumber - b.lineNumber)
      } else if (matchingUsers.length === 1) {
        const foundUser = matchingUsers[0]
        const foundLineNumber = foundUser.lineNumber

        let startLine = Math.max(1, foundLineNumber - 5)

        const maxUserLine = Math.max(...unclassifiedUsers.map((u) => u.lineNumber))
        if (foundLineNumber > maxUserLine - 4) {
          startLine = Math.max(1, maxUserLine - 9)
        }

        const usedPositions = categoryUsedPositions[currentCategory] || new Set()
        const allLines = generateLines().filter((line) => {
          if (line.id < 0) {
            // Empty line - only show if position never used
            return !usedPositions.has(line.lineNumber)
          }
          return true
        })
        return allLines.slice(startLine - 1, startLine + 9)
      }
    }

    if (showAllLines) {
      const usedPositions = categoryUsedPositions[currentCategory] || new Set()
      return generateLines().filter((line) => {
        if (line.id < 0) {
          // Empty line - only show if position never used
          return !usedPositions.has(line.lineNumber)
        }
        return true
      })
    } else {
      return unclassifiedUsers.sort((a, b) => a.lineNumber - b.lineNumber)
    }
  }

  const displayLines = useMemo(
    () => getDisplayLines(),
    [
      searchTerm,
      highlightedUserId,
      showAllLines,
      users,
      generateLines,
      activeForceView,
      categoryForceUsers,
      currentCategory,
      categoryUsedPositions, // Added to dependency array
    ],
  )

  const handleLineClick = (lineNumber: number) => {
    const existingUser = users.find((u) => u.lineNumber === lineNumber)
    if (!existingUser) {
      setEditingLine(lineNumber)
      setEditingField("name")
      setTempName("")
      setTempEntity("")
      setTempForce("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, lineNumber: number) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (editingField === "name") {
        const upperCaseName = tempName.toUpperCase()
        setTempName(upperCaseName)

        if (upperCaseName.trim()) {
          setEditingField("entity")
        } else {
          const existingUser = users.find((u) => u.lineNumber === lineNumber)
          if (existingUser) {
            const userName = existingUser.name.toLowerCase()
            const usersWithSameName = users.filter((u) => u.name.toLowerCase() === userName)

            if (usersWithSameName.length > 1) {
              const updatedUsers = users
                .filter((u) => u.lineNumber !== lineNumber)
                .map((u) => (u.name.toLowerCase() === userName ? { ...u, lives: Math.max(0, u.lives - 1) } : u))
              setUsers(updatedUsers)
            } else {
              setUsers((prev) => prev.filter((u) => u.lineNumber !== lineNumber))
            }
          }

          const nextLine = findNextAvailableLine(lineNumber)
          if (nextLine) {
            setEditingLine(nextLine)
            setEditingField("name")
            setTempName("")
            setTempEntity("")
            setTempForce("")
          } else {
            setEditingLine(null)
            setEditingField(null)
          }
        }
      } else if (editingField === "entity") {
        const upperCaseEntity = tempEntity.toUpperCase()
        setTempEntity(upperCaseEntity)

        if (!tempName.trim() && !upperCaseEntity.trim()) {
          const existingUser = users.find((u) => u.lineNumber === lineNumber)
          if (existingUser) {
            const userName = existingUser.name.toLowerCase()
            const usersWithSameName = users.filter((u) => u.name.toLowerCase() === userName)

            if (usersWithSameName.length > 1) {
              const updatedUsers = users
                .filter((u) => u.lineNumber !== lineNumber)
                .map((u) => (u.name.toLowerCase() === userName ? { ...u, lives: Math.max(0, u.lives - 1) } : u))
              setUsers(updatedUsers)
            } else {
              setUsers((prev) => prev.filter((u) => u.lineNumber !== lineNumber))
            }
          }
        } else if (tempName.trim()) {
          const existingUser = users.find((user) => user.name.toLowerCase() === tempName.trim().toLowerCase())

          if (existingUser) {
            setConfirmationModal({
              show: true,
              userName: tempName.trim().toUpperCase(),
              userEntity: upperCaseEntity.trim(),
              onConfirm: () => {
                const updatedUsers = users.map((user) =>
                  user.name.toLowerCase() === tempName.trim().toLowerCase() ? { ...user, lives: user.lives + 1 } : user,
                )

                const newUser: UserType = {
                  id: Date.now(),
                  name: tempName.trim().toUpperCase(),
                  entity: upperCaseEntity.trim(),
                  lives: existingUser.lives + 1,
                  lineNumber: lineNumber,
                }

                const finalUsers = updatedUsers.filter((u) => u.lineNumber !== lineNumber)
                setUsers([...finalUsers, newUser])

                setCategoryUsedPositions((prev) => {
                  const currentUsed = prev[currentCategory] || new Set()
                  const newUsed = new Set(currentUsed)
                  newUsed.add(lineNumber)
                  return { ...prev, [currentCategory]: newUsed }
                })

                if (forceSelectionEnabled) {
                  // If force selection is enabled (green), move to force field
                  setEditingField("force")
                  setTempForce("")
                } else {
                  // If force selection is disabled (red), move to next line
                  const nextLine = findNextAvailableLine(lineNumber)
                  if (nextLine) {
                    setEditingLine(nextLine)
                    setEditingField("name")
                    setTempName("")
                    setTempEntity("")
                    setTempForce("")
                  } else {
                    setEditingLine(null)
                    setEditingField(null)
                  }
                }

                setConfirmationModal((prev) => ({ ...prev, show: false }))
              },
              onCancel: () => {
                setConfirmationModal((prev) => ({ ...prev, show: false }))
              },
            })
            return
          }

          const newUser: UserType = {
            id: Date.now(),
            name: tempName.trim().toUpperCase(),
            entity: upperCaseEntity.trim(),
            lives: 0,
            lineNumber: lineNumber,
          }

          const filteredUsers = users.filter((u) => u.lineNumber !== lineNumber)
          setUsers([...filteredUsers, newUser])

          setCategoryUsedPositions((prev) => {
            const currentUsed = prev[currentCategory] || new Set()
            const newUsed = new Set(currentUsed)
            newUsed.add(lineNumber)
            return { ...prev, [currentCategory]: newUsed }
          })
        }

        if (!confirmationModal.show) {
          if (forceSelectionEnabled && tempName.trim()) {
            // If force selection is enabled (green) and we have a name, move to force field
            setEditingField("force")
            setTempForce("")
          } else {
            // If force selection is disabled (red) or no name, move to next line
            const nextLine = findNextAvailableLine(lineNumber)
            if (nextLine) {
              setEditingLine(nextLine)
              setEditingField("name")
              setTempName("")
              setTempEntity("")
              setTempForce("")
            } else {
              setEditingLine(null)
              setEditingField(null)
            }
          }
        }
      } else if (editingField === "force") {
        const upperCaseForce = tempForce.toUpperCase()

        // Validate force is A, B, C, or empty
        if (upperCaseForce === "" || ["A", "B", "C"].includes(upperCaseForce)) {
          setUsers((prev) =>
            prev.map((u) =>
              u.lineNumber === lineNumber
                ? { ...u, force: upperCaseForce ? (upperCaseForce as "A" | "B" | "C") : undefined }
                : u,
            ),
          )

          if (upperCaseForce && ["A", "B", "C"].includes(upperCaseForce)) {
            const currentScores = categoryScores[currentCategory] || {}
            const user = users.find((u) => u.lineNumber === lineNumber)

            if (user) {
              // Create updated user with new force
              const updatedUser = { ...user, force: upperCaseForce as "A" | "B" | "C" }

              // Check force classification with current scores
              setTimeout(() => {
                const forceResult = checkForceClassification(lineNumber, currentScores)

                // If user doesn't meet requirements, move to trash
                if (forceResult === "trash") {
                  moveUserToForce(updatedUser, "trash")
                } else if (forceResult) {
                  // Move to the appropriate force
                  moveUserToForce(updatedUser, forceResult)
                }
              }, 0)
            }
          }
        }

        const nextLine = findNextAvailableLine(lineNumber)
        if (nextLine) {
          setEditingLine(nextLine)
          setEditingField("name")
          setTempName("")
          setTempEntity("")
          setTempForce("")
        } else {
          setEditingLine(null)
          setEditingField(null)
          setTempName("")
          setTempEntity("")
          setTempForce("")
        }
      }
    }
  }

  const findNextAvailableLine = (currentLine: number) => {
    const usedPositions = categoryUsedPositions[currentCategory] || new Set()

    for (let i = currentLine + 1; i <= 800; i++) {
      // Skip if this position has ever been used
      if (usedPositions.has(i)) {
        continue
      }

      const existingUser = users.find((u) => u.lineNumber === i)
      if (!existingUser) {
        return i
      }
    }
    return null
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (searchTerm.trim()) {
        const searchTermLower = searchTerm.toLowerCase()
        const matchingUsers = users.filter((user) => user.name.toLowerCase().includes(searchTermLower))

        if (matchingUsers.length > 0) {
          console.log(
            "[v0] Found users:",
            matchingUsers.map((u) => `${u.name} at line ${u.lineNumber}`),
          )
          setHighlightedUserId(matchingUsers[0].id)
        } else {
          alert("Usuário não encontrado!")
        }
      }
    }
  }

  const handleUserSelection = (option: string) => {
    setSelectedUserType(option)
    setIsDropdownOpen(false)
    setShowRodeios(true)
  }

  const handleLineDoubleClick = (userId: number) => {
    if (activeForceView === "trash") {
      // In trash view: restore the user
      recoverUserFromTrash(userId)
    } else {
      // In normal view: delete the user
      handleDoubleClickDelete(userId)
    }
  }

  const handleDoubleClickDelete = (userId: number) => {
    const userToDelete = users.find((user) => user.id === userId)
    if (userToDelete) {
      const userName = userToDelete.name.toLowerCase()
      const usersWithSameName = users.filter((u) => u.name.toLowerCase() === userName)

      if (usersWithSameName.length > 1) {
        const updatedUsers = users
          .filter((user) => user.id !== userId)
          .map((u) => (u.name.toLowerCase() === userName ? { ...u, lives: Math.max(0, u.lives - 1) } : u))
        setUsers(updatedUsers)
      } else {
        setUsers(users.filter((user) => user.id !== userId))
      }
    }

    if (highlightedUserId === userId) {
      setHighlightedUserId(null)
      setSearchTerm("")
    }
  }

  const handleBackToUserSelection = () => {
    setShowRodeios(false)
    setSelectedUserType(null)
    setIsDropdownOpen(true)
  }

  const handleRodeioSelection = (rodeioName: string) => {
    setSelectedRodeio(rodeioName)
    setShowRodeios(false)
    setShowPasswordScreen(true)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      (selectedUserType === "Narrador" && password === "2008322") ||
      (selectedUserType === "Juiz" && password === "2000123") ||
      (selectedUserType === "Laçador" && password === "1900123") ||
      (selectedUserType === "outros" && password === "1566743")
    ) {
      console.log(`Password correct for ${selectedUserType}`)
      setShowPasswordScreen(false)
      setPassword("")
      setShowPassword(false)
      if (selectedUserType === "outros") {
        setShowDashboard(true)
        // Initialize force configs and users for the first category
        const initialCategory = categories[0]
        const initialConfig: CategoryForceConfig = {
          [initialCategory]: {
            A: { voltas: 3, mataMata: 5 },
            B: { voltas: 3, mataMata: 5 },
            C: { voltas: 3, mataMata: 5 },
            CEnabled: true,
          },
        }
        setCategoryForceConfig(initialConfig)
        setCategoryForceUsers((prev) => ({ ...prev, [initialCategory]: { A: [], B: [], C: [], trash: [] } }))
        // Initialize used positions for the first category
        setCategoryUsedPositions((prev) => ({ ...prev, [initialCategory]: new Set() }))
      }
    } else {
      alert("Senha incorreta!")
    }
  }

  const handleBackFromPassword = () => {
    setShowPasswordScreen(false)
    setShowRodeios(true)
    setPassword("")
    setShowPassword(false)
  }

  const handleAddNewRodeio = () => {
    setShowRodeios(false)
    console.log("Add new rodeo clicked")
  }

  const handleAddUserClick = () => {
    setShowAddUserForm(true)
  }

  const handleAddUser = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (newUserName.trim()) {
        const upperCaseName = newUserName.trim().toUpperCase()
        const upperCaseEntity = newUserEntity.trim().toUpperCase()
        const upperCaseForce = newUserForce.trim().toUpperCase()

        const existingUser = users.find((user) => user.name.toLowerCase() === upperCaseName.toLowerCase())

        const usedPositions = categoryUsedPositions[currentCategory] || new Set()
        let nextLineNumber = 1

        // Find the first position that has never been used
        while (usedPositions.has(nextLineNumber) || users.find((u) => u.lineNumber === nextLineNumber)) {
          nextLineNumber++
        }

        if (existingUser) {
          setConfirmationModal({
            show: true,
            userName: upperCaseName,
            userEntity: upperCaseEntity,
            onConfirm: () => {
              const newUser: UserType = {
                id: Date.now(),
                name: upperCaseName,
                entity: upperCaseEntity,
                lives: existingUser.lives + 1,
                lineNumber: nextLineNumber,
                ...(upperCaseForce &&
                  ["A", "B", "C"].includes(upperCaseForce) && { force: upperCaseForce as "A" | "B" | "C" }),
              }

              setUsers((prev) => [...prev, newUser])

              setCategoryUsedPositions((prev) => {
                const currentUsed = prev[currentCategory] || new Set()
                const newUsed = new Set(currentUsed)
                newUsed.add(nextLineNumber)
                return { ...prev, [currentCategory]: newUsed }
              })

              if (newUser.force && forceSelectionEnabled) {
                const currentScores = categoryScores[currentCategory] || {}
                const forceResult = checkForceClassification(nextLineNumber, currentScores)

                // If user has scores and doesn't meet requirements, move to trash
                if (forceResult === "trash") {
                  setTimeout(() => {
                    moveUserToForce(newUser, "trash")
                  }, 0)
                }
              }

              setNewUserName("")
              setNewUserEntity("")
              setNewUserForce("")
              setTimeout(() => {
                const nameInput = document.querySelector(
                  'input[placeholder="Digite o nome do usuário..."]',
                ) as HTMLInputElement
                if (nameInput) {
                  nameInput.focus()
                }
              }, 0)
              setConfirmationModal((prev) => ({ ...prev, show: false }))
            },
            onCancel: () => {
              setConfirmationModal((prev) => ({ ...prev, show: false }))
            },
          })
        } else {
          const newUser: UserType = {
            id: Date.now(),
            name: upperCaseName,
            entity: upperCaseEntity,
            lives: 0,
            lineNumber: nextLineNumber,
            ...(upperCaseForce &&
              ["A", "B", "C"].includes(upperCaseForce) && { force: upperCaseForce as "A" | "B" | "C" }),
          }
          setUsers((prev) => [...prev, newUser])

          setCategoryUsedPositions((prev) => {
            const currentUsed = prev[currentCategory] || new Set()
            const newUsed = new Set(currentUsed)
            newUsed.add(nextLineNumber)
            return { ...prev, [currentCategory]: newUsed }
          })

          if (newUser.force && forceSelectionEnabled) {
            const currentScores = categoryScores[currentCategory] || {}
            const forceResult = checkForceClassification(nextLineNumber, currentScores)

            // If user has scores and doesn't meet requirements, move to trash
            if (forceResult === "trash") {
              setTimeout(() => {
                moveUserToForce(newUser, "trash")
              }, 0)
            }
          }

          setNewUserName("")
          setNewUserEntity("")
          setNewUserForce("")
          setTimeout(() => {
            const nameInput = document.querySelector(
              'input[placeholder="Digite o nome do usuário..."]',
            ) as HTMLInputElement
            if (nameInput) {
              nameInput.focus()
            }
          }, 0)
        }
      }
    },
    [
      newUserName,
      newUserEntity,
      newUserForce,
      users,
      currentCategory,
      categoryUsedPositions,
      forceSelectionEnabled,
      categoryScores,
      moveUserToForce,
      checkForceClassification,
    ],
  )

  const handleCancelAddUser = () => {
    setShowAddUserForm(false)
    setNewUserName("")
    setNewUserEntity("")
    setNewUserForce("")
  }

  const handleExistingLineClick = (lineNumber: number) => {
    const existingUser = users.find((u) => u.lineNumber === lineNumber)
    if (existingUser) {
      setEditingLine(lineNumber)
      setEditingField("name")
      setTempName(existingUser.name)
      setTempEntity(existingUser.entity)
      setTempForce(existingUser.force || "")
    }
  }

  const handleSquareRightClick = (e: React.MouseEvent, lineNumber: number, squareIndex: number) => {
    // Only allow right-click if modality is not configured yet
    if (isModalityConfigured) {
      e.preventDefault()
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const { voltas, mataMata } = parseClassification(classificationText)
    setSquareInputValue(`${voltas} e ${mataMata}`)
    setSquareContextMenu({ show: true, x: e.clientX, y: e.clientY })
  }

  const handleSquareClick = (e: React.MouseEvent, lineNumber: number, squareIndex: number) => {
    e.stopPropagation()
    setEditingSquare({ lineNumber, squareIndex })
  }

  const handleSquareInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      // Parse input like "3 e 5" or "2 e 4"
      const match = squareInputValue.match(/(\d+)\s*e\s*(\d+)/i)
      if (match) {
        const newVoltas = Number.parseInt(match[1])
        const newMataMata = Number.parseInt(match[2])

        // Update the classification text
        const newClassificationText = `${newVoltas} VOLTAS MAIS ${newMataMata} DE MATA-MATA`
        setClassificationText(newClassificationText)
      }

      setSquareContextMenu({ ...squareContextMenu, show: false })
      setSquareInputValue("")
    } else if (e.key === "Escape") {
      setSquareContextMenu({ ...squareContextMenu, show: false })
      setSquareInputValue("")
    }
  }

  const handleForceRightClick = (e: React.MouseEvent, force: "A" | "B" | "C") => {
    // Only allow right-click if modality is not configured yet
    if (isModalityConfigured) {
      e.preventDefault()
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const currentConfig = categoryForceConfig[currentCategory]?.[force] || { voltas: 3, mataMata: 5 }

    setForceContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      force,
    })
    setForceInputValue(`${currentConfig.voltas} e ${currentConfig.mataMata}`)
  }

  const handleForceInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      if (!forceContextMenu.force) return

      // Check for disable command (X)
      if (forceInputValue.trim().toUpperCase() === "X" && forceContextMenu.force === "C") {
        setCategoryForceConfig((prev) => ({
          ...prev,
          [currentCategory]: {
            ...prev[currentCategory],
            CEnabled: false,
          },
        }))
        setForceContextMenu({ ...forceContextMenu, show: false })
        setForceInputValue("")
        return
      }

      // Parse input like "3 e 5" or "2 e 4"
      const match = forceInputValue.match(/(\d+)\s*e\s*(\d+)/i)
      if (match) {
        const newVoltas = Number.parseInt(match[1])
        const newMataMata = Number.parseInt(match[2])

        setCategoryForceConfig((prev) => ({
          ...prev,
          [currentCategory]: {
            ...prev[currentCategory],
            [forceContextMenu.force!]: { voltas: newVoltas, mataMata: newMataMata },
            CEnabled: prev[currentCategory]?.CEnabled ?? true,
          },
        }))
      }

      setForceContextMenu({ ...forceContextMenu, show: false })
      setForceInputValue("")
    } else if (e.key === "Escape") {
      setForceContextMenu({ ...forceContextMenu, show: false })
      setForceInputValue("")
    }
  }

  const recoverUserFromTrash = (userId: number) => {
    const forceUsers = categoryForceUsers[currentCategory]
    if (!forceUsers) return

    const userInTrash = forceUsers.trash.find((u) => u.id === userId)
    if (!userInTrash) return

    // Remove from trash
    setCategoryForceUsers((prev) => ({
      ...prev,
      [currentCategory]: {
        ...prev[currentCategory],
        trash: prev[currentCategory].trash.filter((u) => u.id !== userId),
      },
    }))

    const usedPositions = categoryUsedPositions[currentCategory] || new Set()
    let nextLineNumber = 1

    while (usedPositions.has(nextLineNumber) || users.find((u) => u.lineNumber === nextLineNumber)) {
      nextLineNumber++
    }

    // Add back to main list with new position
    const recoveredUser = { ...userInTrash, lineNumber: nextLineNumber }
    setUsers((prev) => [...prev, recoveredUser])

    setCategoryUsedPositions((prev) => {
      const currentUsed = prev[currentCategory] || new Set()
      const newUsed = new Set(currentUsed)
      newUsed.add(nextLineNumber)
      return { ...prev, [currentCategory]: newUsed }
    })

    // Clear their scores
    setCategoryScores((prev) => {
      const newScores = { ...prev[currentCategory] }
      Object.keys(newScores).forEach((key) => {
        if (key.startsWith(`${userInTrash.lineNumber}-`)) {
          delete newScores[key]
        }
      })
      return {
        ...prev,
        [currentCategory]: newScores,
      }
    })
  }

  const handleClassificationClick = () => {
    if (isModalityConfigured) {
      return
    }
    setIsEditingClassification(true)
    setTempClassificationText(classificationText)
  }

  const handleClassificationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const upperCaseText = tempClassificationText.toUpperCase()
      setClassificationText(upperCaseText)
      setIsEditingClassification(false)
    } else if (e.key === "Escape") {
      setIsEditingClassification(false)
    }
  }

  const handleClassificationFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const handleCategoryClick = (category: "A" | "B" | "C" | "D") => {
    // Allow editing for 'D' if it's enabled in modalityConfig
    if (isModalityConfigured && !modalityConfig.forcesEnabled[category]) {
      return
    }
    setEditingCategory(category)
    if (category === "A") setTempCategoryText(categoryInfo[currentCategory]?.A || "")
    if (category === "B") setTempCategoryText(categoryInfo[currentCategory]?.B || "")
    if (category === "C") setTempCategoryText(categoryInfo[currentCategory]?.C || "")
    if (category === "D") setTempCategoryText(categoryInfo[currentCategory]?.D || "")
  }

  const handleCategoryKeyDown = (e: React.KeyboardEvent, category: "A" | "B" | "C" | "D") => {
    if (e.key === "Enter") {
      e.preventDefault()
      const upperCaseText = tempCategoryText.toUpperCase()
      setCategoryInfo((prev) => ({
        ...prev,
        [currentCategory]: {
          ...(prev[currentCategory] || {}),
          [category]: upperCaseText,
        },
      }))
      setEditingCategory(null)
    } else if (e.key === "Escape") {
      setEditingCategory(null)
    }
  }

  const handleCategoryFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const currentScores = getCurrentScores()
  const currentPosition = getCurrentPosition()

  const forceUsers = categoryForceUsers[currentCategory] || { A: [], B: [], C: [], trash: [] }
  const forceCountA = forceUsers.A.length
  const forceCountB = forceUsers.B.length
  const forceCountC = forceUsers.C.length
  // Get force count for D
  const forceCountD = forceUsers.D?.length || 0
  const forceConfig = categoryForceConfig[currentCategory]
  const cEnabled = forceConfig?.CEnabled ?? true

  const handleForceClick = (force: "A" | "B" | "C" | "D") => {
    // Allow "D" if it's enabled in modalityConfig
    if (!modalityConfig.forcesEnabled[force]) {
      return
    }

    if (activeForceView === force) {
      // Clicking the same force again returns to add view
      setActiveForceView(null)
    } else {
      // Switch to the selected force view
      setActiveForceView(force as "A" | "B" | "C" | "trash" | null)
    }
  }

  const handleTrashClick = () => {
    if (activeForceView === "trash") {
      // Clicking trash again returns to add view
      setActiveForceView(null)
    } else {
      // Switch to trash view
      setActiveForceView("trash")
    }
  }

  const isUserInSelectedForce = (userId: number): boolean => {
    if (!selectedForceHighlight) return false
    const forceUsers = categoryForceUsers[currentCategory]
    if (!forceUsers) return false
    return forceUsers[selectedForceHighlight].some((u) => u.id === userId)
  }

  const toggleForceSelection = () => {
    setForceSelectionEnabled((prev) => !prev)
  }

  const handleAddUserNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const entityInput = document.querySelector('input[placeholder="Digite a entidade..."]') as HTMLInputElement
      if (entityInput) {
        entityInput.focus()
      }
    }
  }

  const handleAddUserEntityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (forceSelectionEnabled) {
        if (addUserForceInputRef.current) {
          addUserForceInputRef.current.focus()
        }
      } else {
        // If force selection is disabled (red), submit the form
        handleAddUser(e as any)
      }
    }
  }

  const handleAddUserForceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddUser(e as any)
    }
  }

  const handleForceFieldClick = (e: React.MouseEvent, lineNumber: number) => {
    e.stopPropagation()
    const existingUser = users.find((u) => u.lineNumber === lineNumber)
    if (existingUser) {
      setEditingLine(lineNumber)
      setEditingField("force")
      setTempName(existingUser.name)
      setTempEntity(existingUser.entity)
      setTempForce(existingUser.force || "")
    }
  }

  // Modality Editor Functions
  const handleOpenModalityEditor = () => {
    const currentCategoryForceConfig = categoryForceConfig[currentCategory] || {
      A: { voltas: 3, mataMata: 5 },
      B: { voltas: 3, mataMata: 5 },
      C: { voltas: 3, mataMata: 5 },
      CEnabled: true,
    }
    const currentCategoryForceUsers = categoryForceUsers[currentCategory] || { A: [], B: [], C: [], trash: [] }

    setModalityConfig({
      name: categoryTitles[currentCategory] || currentCategory,
      classificationText: classificationText,
      forcesEnabled: {
        A: true,
        B: true,
        C: currentCategoryForceConfig.CEnabled,
        D: currentCategoryForceConfig.DEnabled ?? false, // Use DEnabled if available, otherwise false
      },
      forceRequirements: {
        A: currentCategoryForceConfig.A.voltas,
        B: currentCategoryForceConfig.B.voltas,
        C: currentCategoryForceConfig.C.voltas,
        D: currentCategoryForceConfig.D?.voltas || 0, // Assuming D also has a 'voltas' property for requirement
      },
      errorRules: {
        allowedRound: 0, // Default or retrieve from somewhere if saved
      },
    })
    setEditorStep(1)
    setShowModalityEditor(true)
  }

  const handleModalityEditorNext = () => {
    if (editorStep < 6) {
      setEditorStep(editorStep + 1)
    }
  }

  const handleModalityEditorPrev = () => {
    if (editorStep > 1) {
      setEditorStep(editorStep - 1)
    }
  }

  const handleSaveModalityConfig = () => {
    // Apply the name to the category title
    if (modalityConfig.name) {
      setCategoryTitles((prev) => ({
        ...prev,
        [currentCategory]: modalityConfig.name,
      }))
    }

    // Apply classification text
    setClassificationText(modalityConfig.classificationText)

    // Apply force requirements to category info
    setCategoryInfo((prev) => ({
      ...prev,
      [currentCategory]: {
        A: modalityConfig.forceRequirements.A.toString(),
        B: modalityConfig.forceRequirements.B.toString(),
        C: modalityConfig.forceRequirements.C.toString(),
        D: modalityConfig.forceRequirements.D.toString(),
      },
    }))

    // Apply force enabled states and update force configs
    setCategoryForceConfig((prev) => {
      const updatedConfig = { ...prev[currentCategory] }

      // Update CEnabled
      updatedConfig.CEnabled = modalityConfig.forcesEnabled.C

      // Update DEnabled
      updatedConfig.DEnabled = modalityConfig.forcesEnabled.D

      // Update force requirements for A, B, C, D
      updatedConfig.A.voltas = modalityConfig.forceRequirements.A
      updatedConfig.B.voltas = modalityConfig.forceRequirements.B
      updatedConfig.C.voltas = modalityConfig.forceRequirements.C
      // Ensure D exists before updating its voltas
      if (!updatedConfig.D) {
        updatedConfig.D = { voltas: 0, mataMata: 0 } // Initialize D if it doesn't exist
      }
      updatedConfig.D.voltas = modalityConfig.forceRequirements.D

      return {
        ...prev,
        [currentCategory]: updatedConfig,
      }
    })

    // Mark modality as configured
    setIsModalityConfigured(true)

    // Close the editor
    setShowModalityEditor(false)
    setEditorStep(1)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDashboard || editingLine !== null || isEditingClassification || editingCategory !== null) {
        return
      }

      const displayedLines = displayLines.filter((line) => line.id > 0) // Only users, not empty lines

      if (displayedLines.length === 0) return

      if (editingSquare) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault()
          const key = `${editingSquare.lineNumber}-${editingSquare.squareIndex}`
          const squareNumber = editingSquare.squareIndex + 1

          setCategoryScores((prevScores) => {
            const newScores = {
              ...prevScores[currentCategory],
              [key]: { color: "green" as const, number: squareNumber },
            }

            const user = displayedLines.find((u) => u.lineNumber === editingSquare.lineNumber)
            if (user) {
              const force = checkForceClassification(editingSquare.lineNumber, newScores)
              if (force) {
                if (activeForceView === "trash" && force !== "trash") {
                  recoverUserFromTrashToForce(user, force)
                } else if (activeForceView !== "trash") {
                  moveUserToForce(user, force)
                }
              }
            }

            return {
              ...prevScores,
              [currentCategory]: newScores,
            }
          })
          setEditingSquare(null)
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault()
          const key = `${editingSquare.lineNumber}-${editingSquare.squareIndex}`
          const squareNumber = editingSquare.squareIndex + 1

          setCategoryScores((prevScores) => {
            const newScores = {
              ...prevScores[currentCategory],
              [key]: { color: "red" as const, number: squareNumber },
            }

            const user = displayedLines.find((u) => u.lineNumber === editingSquare.lineNumber)
            if (user) {
              const force = checkForceClassification(editingSquare.lineNumber, newScores)
              if (force) {
                if (activeForceView === "trash" && force !== "trash") {
                  recoverUserFromTrashToForce(user, force)
                } else if (activeForceView !== "trash") {
                  moveUserToForce(user, force)
                }
              }
            }

            return {
              ...prevScores,
              [currentCategory]: newScores,
            }
          })
          setEditingSquare(null)
        } else if (e.key === "Enter") {
          e.preventDefault()
          setEditingSquare(null)
        } else if (e.key === "Escape") {
          e.preventDefault()
          setEditingSquare(null)
        }
        return
      }

      // Original keyboard handler logic
      if (e.key === "=" || e.key === "+") {
        e.preventDefault()

        setCategoryPositions((prevPositions) => {
          const currentPosition = prevPositions[currentCategory] || { lineNumber: 1, squareIndex: 0 }

          const key = `${currentPosition.lineNumber}-${currentPosition.squareIndex}`
          const displayNumber = currentPosition.squareIndex + 1

          // Update scores
          setCategoryScores((prevScores) => {
            const currentScores = prevScores[currentCategory] || {}
            const newScores = {
              ...currentScores,
              [key]: { number: displayNumber, color: "green" as const },
            }

            // Calculate next position with updated scores
            const nextPosition = calculateNextPosition(displayedLines, currentPosition, newScores, totalSquares)

            const user = displayedLines.find((u) => u.lineNumber === currentPosition.lineNumber)
            if (user) {
              const force = checkForceClassification(currentPosition.lineNumber, newScores)
              if (force) {
                if (activeForceView === "trash" && force !== "trash") {
                  recoverUserFromTrashToForce(user, force)
                } else if (activeForceView !== "trash") {
                  moveUserToForce(user, force)
                }
              }
            }

            return {
              ...prevScores,
              [currentCategory]: newScores,
            }
          })

          // Calculate and return next position
          const currentScores = categoryScores[currentCategory] || {}
          const newScores = {
            ...currentScores,
            [key]: { number: displayNumber, color: "green" as const },
          }
          const nextPosition = calculateNextPosition(displayedLines, currentPosition, newScores, totalSquares)

          return {
            ...prevPositions,
            [currentCategory]: nextPosition,
          }
        })
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault()

        setCategoryPositions((prevPositions) => {
          const currentPosition = prevPositions[currentCategory] || { lineNumber: 1, squareIndex: 0 }

          const key = `${currentPosition.lineNumber}-${currentPosition.squareIndex}`
          const displayNumber = currentPosition.squareIndex + 1

          // Update scores
          setCategoryScores((prevScores) => {
            const currentScores = prevScores[currentCategory] || {}
            const newScores = {
              ...currentScores,
              [key]: { number: displayNumber, color: "red" as const },
            }

            const user = displayedLines.find((u) => u.lineNumber === currentPosition.lineNumber)
            if (user) {
              const force = checkForceClassification(currentPosition.lineNumber, newScores)
              if (force) {
                if (activeForceView === "trash" && force !== "trash") {
                  recoverUserFromTrashToForce(user, force)
                } else if (activeForceView !== "trash") {
                  moveUserToForce(user, force)
                }
              }
            }

            return {
              ...prevScores,
              [currentCategory]: newScores,
            }
          })

          // Calculate and return next position
          const currentScores = categoryScores[currentCategory] || {}
          const newScores = {
            ...currentScores,
            [key]: { number: displayNumber, color: "red" as const },
          }
          const nextPosition = calculateNextPosition(displayedLines, currentPosition, newScores, totalSquares)

          return {
            ...prevPositions,
            [currentCategory]: nextPosition,
          }
        })
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [
    showDashboard,
    editingLine,
    isEditingClassification,
    editingCategory,
    currentCategory,
    displayLines,
    totalSquares,
    categoryScores, // Added categoryScores to dependency array
    editingSquare, // Added editingSquare to dependency array
    activeForceView, // Added activeForceView to dependency array
    recoverUserFromTrashToForce, // Added function to dependency array
    moveUserToForce, // Added function to dependency array
  ])

  const calculateNextPosition = (
    displayedLines: UserType[],
    currentPosition: { lineNumber: number; squareIndex: number },
    currentScores: { [key: string]: Score },
    maxSquares: number,
  ) => {
    const currentPlayerIndex = displayedLines.findIndex((line) => line.lineNumber === currentPosition.lineNumber)

    if (currentPlayerIndex === -1) {
      return {
        lineNumber: displayedLines[0].lineNumber,
        squareIndex: 0,
      }
    }

    // Determine the range of players based on group size
    let startIndex = 0
    let endIndex = displayedLines.length

    if (groupSize === 10 || groupSize === 20) {
      // Calculate which group the current player belongs to
      const currentGroup = Math.floor(currentPlayerIndex / groupSize)
      startIndex = currentGroup * groupSize
      endIndex = Math.min(startIndex + groupSize, displayedLines.length)
    }

    // Try each player in the current group starting from the next one
    for (let i = 1; i <= endIndex - startIndex; i++) {
      const nextPlayerIndex = startIndex + ((currentPlayerIndex - startIndex + i) % (endIndex - startIndex))
      const nextPlayer = displayedLines[nextPlayerIndex]

      // Find the first empty square for this player
      for (let squareIndex = 0; squareIndex < maxSquares; squareIndex++) {
        const key = `${nextPlayer.lineNumber}-${squareIndex}`

        if (!currentScores[key]) {
          return {
            lineNumber: nextPlayer.lineNumber,
            squareIndex: squareIndex,
          }
        }
      }
    }

    // All players in current group have all squares filled
    // Move to the next group if using group mode
    if (groupSize === 10 || groupSize === 20) {
      const nextGroupStartIndex = endIndex
      if (nextGroupStartIndex < displayedLines.length) {
        // Move to first player of next group
        const nextPlayer = displayedLines[nextGroupStartIndex]
        for (let squareIndex = 0; squareIndex < maxSquares; squareIndex++) {
          const key = `${nextPlayer.lineNumber}-${squareIndex}`
          if (!currentScores[key]) {
            return {
              lineNumber: nextPlayer.lineNumber,
              squareIndex: squareIndex,
            }
          }
        }
      }
    }

    // Stay at current position if all done
    return currentPosition
  }

  useEffect(() => {
    let scrollGlobal = 0
    const PASSO = 40 // Reduced step for smoother scrolling

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement
      const containerQuadrados = target.closest(".container-quadrados") as HTMLElement

      if (!containerQuadrados) return

      e.preventDefault()

      // Use smaller increments for smoother scroll
      scrollGlobal += e.deltaY > 0 ? PASSO : -PASSO
      scrollGlobal = Math.max(0, scrollGlobal) // Prevent negative scroll

      // Use requestAnimationFrame for smoother rendering
      requestAnimationFrame(() => {
        const allContainers = document.querySelectorAll(".container-quadrados") as NodeListOf<HTMLElement>
        allContainers.forEach((container) => {
          container.scrollLeft = scrollGlobal
        })
      })
    }

    const allContainers = document.querySelectorAll(".container-quadrados")
    allContainers.forEach((container) => {
      container.addEventListener("wheel", handleWheel, { passive: false })
    })

    return () => {
      allContainers.forEach((container) => {
        container.removeEventListener("wheel", handleWheel)
      })
    }
  }, [displayLines])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const userListContainer = document.querySelector("[data-user-list]")
      const searchInput = document.querySelector('input[placeholder*="Pesquisar"]')

      // Close user options dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(target) && isDropdownOpen) {
        setIsDropdownOpen(false)
      }

      // Close rodeios dropdown if clicking outside
      if (rodeiosRef.current && !rodeiosRef.current.contains(target) && showRodeios) {
        setShowRodeios(false)
        setSelectedUserType(null)
      }

      if (userListContainer && !userListContainer.contains(target) && target !== searchInput) {
        setHighlightedUserId(null)
        setSearchTerm("")
        setEditingLine(null)
        setEditingField(null)
      }

      // Close square context menu if clicking outside
      if (squareContextMenu.show && !document.querySelector('[aria-label="square-context-menu"]')?.contains(target)) {
        setSquareContextMenu({ ...squareContextMenu, show: false })
      }

      // Close force context menu if clicking outside
      if (forceContextMenu.show && !document.querySelector('[aria-label="force-context-menu"]')?.contains(target)) {
        setForceContextMenu({ ...forceContextMenu, show: false })
      }

      if (showForceUsersModal.show) {
        const modal = document.querySelector("[data-force-users-modal]")
        if (modal && !modal.contains(target)) {
          setShowForceUsersModal({ show: false, force: null })
          // Reset selected force highlight when closing modal
          setSelectedForceHighlight(null)
        }
      }

      // Close editing square if clicking outside
      if (editingSquare) {
        setEditingSquare(null)
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isDropdownOpen, showRodeios, showForceUsersModal, editingSquare, squareContextMenu, forceContextMenu])

  useEffect(() => {
    const scrollContainers = document.querySelectorAll("[data-scroll-sync]")
    if (scrollContainers.length < 2) return

    const firstContainer = scrollContainers[0] as HTMLElement
    const secondContainer = scrollContainers[1] as HTMLElement

    const handleScroll = () => {
      const scrollLeft = firstContainer.scrollLeft
      if (secondContainer.scrollLeft !== scrollLeft) {
        secondContainer.scrollLeft = scrollLeft
      }
    }

    firstContainer.addEventListener("scroll", handleScroll)

    // Clean up the event listener when the component unmounts
    return () => {
      firstContainer.removeEventListener("scroll", handleScroll)
    }
  }, [displayLines]) // Re-run if displayLines changes, which could affect scrollable content

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mudar%20imagem%20-YyV59D1SwOkOKeoT0uXeT6dJUCPcbk.png')",
        }}
      />

      {/* Square Context Menu */}
      {squareContextMenu.show && (
        <div
          aria-label="square-context-menu"
          style={{ top: squareContextMenu.y, left: squareContextMenu.x }}
          className="absolute z-50 bg-white shadow-lg rounded-md p-2"
        >
          <input
            ref={squareInputRef}
            type="text"
            value={squareInputValue}
            onChange={(e) => setSquareInputValue(e.target.value)}
            onKeyDown={handleSquareInputKeyDown}
            className="w-40 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[rgba(183,146,86,1)]"
            autoFocus
          />
        </div>
      )}

      {/* Force Context Menu */}
      {forceContextMenu.show && (
        <div
          aria-label="force-context-menu"
          style={{ top: forceContextMenu.y, left: forceContextMenu.x }}
          className="absolute z-50 bg-white shadow-lg rounded-md p-2"
        >
          <input
            ref={forceInputRef}
            type="text"
            value={forceInputValue}
            onChange={(e) => setForceInputValue(e.target.value)}
            onKeyDown={handleForceInputKeyDown}
            className="w-40 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[rgba(183,146,86,1)]"
            autoFocus
          />
        </div>
      )}

      {showAddCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">ADICIONAR NOVA CATEGORIA</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
              placeholder="Digite o nome da categoria..."
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:border-[#1F3A2D]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddCategory()
                }
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddCategoryModal(false)
                  setNewCategoryName("")
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                CANCELAR
              </button>
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                ADICIONAR
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmationModal.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Nome já existe!</h3>
            <p className="text-gray-600 mb-6">
              O nome "{confirmationModal.userName}" já está cadastrado. Deseja adicionar mesmo assim e incrementar as
              vidas?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmationModal.onCancel}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={confirmationModal.onConfirm}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDashboard && (
        <div className="absolute inset-0 z-40" style={{ backgroundColor: "#1F3A2D" }}>
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <div className="flex-1">
              {selectedUserType === "outros" && (
                <button
                  onClick={handleOpenModalityEditor}
                  className="flex items-center gap-2 px-3 py-2 bg-[rgba(183,146,86,1)] text-white rounded-lg hover:bg-[rgba(163,126,66,1)] transition-colors"
                  title="Editar Modalidade"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={currentCategory}
                  onChange={handleCategoryChange}
                  className="bg-transparent px-4 py-2 rounded border-2 font-bold border-[rgba(183,146,86,1)] rounded-lg text-center appearance-none text-white cursor-pointer"
                  style={{ width: "auto", minWidth: "12rem" }}
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-green-800 text-yellow-400">
                      {categoryTitles[category] || category}
                    </option>
                  ))}
                </select>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[rgba(183,146,86,1)]"></div>
                </div>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="w-8 h-8 rounded-full bg-[rgba(183,146,86,1)] flex items-center justify-center hover:bg-[rgba(166,123,71,1)] transition-colors"
                title="Adicionar nova categoria"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-end space-x-4">
              <div className="flex gap-2">
                <div
                  onClick={() => handleForceClick("A")}
                  className={`px-2 py-1 rounded font-bold text-center min-w-[24px] text-base overline cursor-pointer transition-colors ${
                    activeForceView === "A"
                      ? "bg-[#8C2A2A] text-white ring-2 ring-yellow-400"
                      : "bg-[#6C1A1A] text-white hover:bg-[#8C2A2A]"
                  }`}
                >
                  A<br />
                  {forceCountA}
                </div>
                <div
                  onClick={() => handleForceClick("B")}
                  className={`px-2 py-1 rounded font-bold text-center min-w-[24px] text-base overline cursor-pointer transition-colors ${
                    activeForceView === "B"
                      ? "bg-[#8C2A2A] text-white ring-2 ring-yellow-400"
                      : "bg-[#6C1A1A] text-white hover:bg-[#8C2A2A]"
                  }`}
                >
                  B<br />
                  {forceCountB}
                </div>
                {cEnabled && (
                  <div
                    onClick={() => handleForceClick("C")}
                    className={`px-2 py-1 rounded font-bold text-center min-w-[24px] text-base overline cursor-pointer transition-colors ${
                      activeForceView === "C"
                        ? "bg-[#8C2A2A] text-white ring-2 ring-yellow-400"
                        : "bg-[#6C1A1A] text-white hover:bg-[#8C2A2A]"
                    }`}
                  >
                    C<br />
                    {forceCountC}
                  </div>
                )}
                {modalityConfig.forcesEnabled.D && (
                  <div
                    onClick={() => handleForceClick("D")}
                    className={`px-2 py-1 rounded font-bold text-center min-w-[24px] text-base overline cursor-pointer transition-colors ${
                      activeForceView === "D"
                        ? "bg-[#8C2A2A] text-white ring-2 ring-yellow-400"
                        : "bg-[#6C1A1A] text-white hover:bg-[#8C2A2A]"
                    }`}
                  >
                    D<br />
                    {forceCountD}
                  </div>
                )}
              </div>

              <Trash2
                className={`w-5 h-5 cursor-pointer transition-colors ${
                  activeForceView === "trash"
                    ? "text-yellow-400 ring-2 ring-yellow-400 rounded"
                    : "text-white hover:text-red-400"
                }`}
                title={`Lixeira (${forceUsers.trash.length})`}
                onClick={handleTrashClick}
              />
              <MoreVertical className="w-5 h-5 text-white cursor-pointer" />
            </div>
          </div>

          <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 p-4">
              <div className="mb-4 ml-6">
                <div className="text-sm mb-2 font-bold text-[rgba(183,146,86,1)]">
                  {activeForceView === "trash" ? (
                    <>LIXEIRA - {forceUsers.trash.length} PESSOAS</>
                  ) : activeForceView ? (
                    <>
                      FORÇA {activeForceView} - {forceUsers[activeForceView].length} PESSOAS
                    </>
                  ) : (
                    <>
                      CLASSIFICAÇÃO -{" "}
                      {isEditingClassification ? (
                        <input
                          type="text"
                          value={tempClassificationText}
                          onChange={(e) => setTempClassificationText(e.target.value.toUpperCase())}
                          onKeyDown={handleClassificationKeyDown}
                          onBlur={() => setIsEditingClassification(false)}
                          onFocus={handleClassificationFocus}
                          className="bg-transparent border-b-2 border-[rgba(183,146,86,1)] outline-none text-[rgba(183,146,86,1)] min-w-[300px] px-1"
                          autoFocus
                        />
                      ) : (
                        <span
                          {...(!isModalityConfigured && {
                            onClick: handleClassificationClick,
                            className: "select-none cursor-pointer hover:opacity-70 hover:underline",
                          })}
                          {...(isModalityConfigured && {
                            className: "select-none",
                          })}
                          onContextMenu={(e) => {
                            if (isModalityConfigured) {
                              e.preventDefault()
                            }
                          }}
                          style={{ userSelect: "none" }}
                        >
                          {classificationText}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="text-[rgba(183,146,86,1)] text-xs mb-3 mt-0">
                  {modalityConfig.forcesEnabled.A && (
                    <>
                      A:{" "}
                      {editingCategory === "A" ? (
                        <input
                          type="text"
                          value={tempCategoryText}
                          onChange={(e) => setTempCategoryText(e.target.value.toUpperCase())}
                          onKeyDown={(e) => handleCategoryKeyDown(e, "A")}
                          onBlur={() => setEditingCategory(null)}
                          onFocus={handleCategoryFocus}
                          className="bg-transparent border-b-2 border-[rgba(183,146,86,1)] outline-none w-20 text-[rgba(183,146,86,1)] px-1"
                          autoFocus
                        />
                      ) : (
                        <span
                          {...(!isModalityConfigured && {
                            onClick: () => handleCategoryClick("A"),
                            className: "select-none cursor-pointer hover:opacity-70 hover:underline",
                          })}
                          {...(isModalityConfigured && {
                            className: "select-none",
                          })}
                          onContextMenu={(e) => {
                            if (isModalityConfigured) {
                              e.preventDefault()
                            }
                          }}
                          style={{ userSelect: "none" }}
                        >
                          {categoryInfo[currentCategory]?.A || "0"}
                        </span>
                      )}{" "}
                    </>
                  )}
                  {modalityConfig.forcesEnabled.B && (
                    <>
                      B:{" "}
                      {editingCategory === "B" ? (
                        <input
                          type="text"
                          value={tempCategoryText}
                          onChange={(e) => setTempCategoryText(e.target.value.toUpperCase())}
                          onKeyDown={(e) => handleCategoryKeyDown(e, "B")}
                          onBlur={() => setEditingCategory(null)}
                          onFocus={handleCategoryFocus}
                          className="bg-transparent border-b-2 border-[rgba(183,146,86,1)] outline-none w-20 text-[rgba(183,146,86,1)] px-1"
                          autoFocus
                        />
                      ) : (
                        <span
                          {...(!isModalityConfigured && {
                            onClick: () => handleCategoryClick("B"),
                            className: "select-none cursor-pointer hover:opacity-70 hover:underline",
                          })}
                          {...(isModalityConfigured && {
                            className: "select-none",
                          })}
                          onContextMenu={(e) => {
                            if (isModalityConfigured) {
                              e.preventDefault()
                            }
                          }}
                          style={{ userSelect: "none" }}
                        >
                          {categoryInfo[currentCategory]?.B || "0"}
                        </span>
                      )}{" "}
                    </>
                  )}
                  {modalityConfig.forcesEnabled.C && (
                    <>
                      C:{" "}
                      {editingCategory === "C" ? (
                        <input
                          type="text"
                          value={tempCategoryText}
                          onChange={(e) => setTempCategoryText(e.target.value.toUpperCase())}
                          onKeyDown={(e) => handleCategoryKeyDown(e, "C")}
                          onBlur={() => setEditingCategory(null)}
                          onFocus={handleCategoryFocus}
                          className="bg-transparent border-b-2 border-[rgba(183,146,86,1)] outline-none w-20 text-[rgba(183,146,86,1)] px-1"
                          autoFocus
                        />
                      ) : (
                        <span
                          {...(!isModalityConfigured && {
                            onClick: () => handleCategoryClick("C"),
                            className: "select-none cursor-pointer hover:opacity-70 hover:underline",
                          })}
                          {...(isModalityConfigured && {
                            className: "select-none",
                          })}
                          onContextMenu={(e) => {
                            if (isModalityConfigured) {
                              e.preventDefault()
                            }
                          }}
                          style={{ userSelect: "none" }}
                        >
                          {categoryInfo[currentCategory]?.C || "0"}
                        </span>
                      )}{" "}
                    </>
                  )}
                  {modalityConfig.forcesEnabled.D && (
                    <>
                      D:{" "}
                      {editingCategory === "D" ? (
                        <input
                          type="text"
                          value={tempCategoryText}
                          onChange={(e) => setTempCategoryText(e.target.value.toUpperCase())}
                          onKeyDown={(e) => handleCategoryKeyDown(e, "D")}
                          onBlur={() => setEditingCategory(null)}
                          onFocus={handleCategoryFocus}
                          className="bg-transparent border-b-2 border-[rgba(183,146,86,1)] outline-none w-20 text-[rgba(183,146,86,1)] px-1"
                          autoFocus
                        />
                      ) : (
                        <span
                          {...(!isModalityConfigured && {
                            onClick: () => handleCategoryClick("D"),
                            className: "select-none cursor-pointer hover:opacity-70 hover:underline",
                          })}
                          {...(isModalityConfigured && {
                            className: "select-none",
                          })}
                          onContextMenu={(e) => {
                            if (isModalityConfigured) {
                              e.preventDefault()
                            }
                          }}
                          style={{ userSelect: "none" }}
                        >
                          {categoryInfo[currentCategory]?.D || "0"}
                        </span>
                      )}{" "}
                    </>
                  )}
                </div>
                <div className="flex flex-col space-y-2 text-xs items-center my-[-9px] mx-0 mr-0 ml-[700px]">
                  <div className="flex items-center">
                    <button
                      onClick={() => setShowAllLines(!showAllLines)}
                      className={`w-2 h-2 rounded-full mr-1 ${showAllLines ? "bg-green-500" : "bg-red-500"}`}
                    ></button>
                    <span className="text-[rgba(183,146,86,1)]">INSCRIÇÕES</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-[rgba(183,146,86,1)]">RETARDATÁRIO</span>
                  </div>
                  <div className="flex items-center cursor-pointer" onClick={toggleForceSelection}>
                    <div
                      className={`w-2 h-2 rounded-full ${forceSelectionEnabled ? "bg-green-500" : "bg-red-500"} mr-1`}
                    ></div>
                    <span className="text-[rgba(183,146,86,1)]">ESCOLHER FORÇA</span>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-[#B79256] rounded-t">
                <div className="flex items-center text-black font-bold text-sm border-[] h-11 my-2">
                  <div className="p-2 border-r border-[#A67B47] text-center flex items-center justify-center w-14 leading-4">
                    <button onClick={handleAddUserClick} className="cursor-pointer">
                      <img src="/add-user-icon.png" alt="Adicionar usuário" className="w-4 h-4 object-contain" />
                    </button>
                  </div>
                  <div className="p-2 border-r border-[#A67B47] text-center text-black w-14">№</div>
                  <div className="p-2 border-r border-[#A67B47] text-black text-center w-64">NOME</div>
                  <div className="flex-1 p-2 flex items-center justify-end">
                    <div className="p-2 border-r border-[#A67B47] flex items-center justify-center tracking-normal text-center leading-7 h-9 px-0 mx-0 w-64">
                      ENTIDADE
                    </div>
                    <div className="p-2 border-r border-[#A67B47] text-center px-0 w-14">{"VIDAS"}</div>
                    <div className="p-2 border-r border-[#A67B47] text-center px-0 py-2 w-14 mr-2 leading-5">
                      {"FORÇA"}
                    </div>
                    <div className="flex gap-0.5 mr-2">
                      <div
                        onClick={() => setGroupSize(0)}
                        className={`w-10 p-2 border-2 border-[#A67B47] text-center text-white text-xs cursor-pointer transition-colors ${
                          groupSize === 0
                            ? "bg-[rgba(31,58,45,1)]"
                            : "bg-[rgba(31,58,45,0.5)] hover:bg-[rgba(31,58,45,0.7)]"
                        }`}
                      >
                        0X
                      </div>
                      <div
                        onClick={() => setGroupSize(10)}
                        className={`w-10 p-2 border-2 border-[#A67B47] text-center text-white text-xs cursor-pointer transition-colors ${
                          groupSize === 10
                            ? "bg-[rgba(31,58,45,1)]"
                            : "bg-[rgba(31,58,45,0.5)] hover:bg-[rgba(31,58,45,0.7)]"
                        }`}
                      >
                        10X
                      </div>
                      <div
                        onClick={() => setGroupSize(20)}
                        className={`w-10 p-2 border-2 border-[#A67B47] text-center text-white text-xs cursor-pointer transition-colors ${
                          groupSize === 20
                            ? "bg-[rgba(31,58,45,1)]"
                            : "bg-[rgba(31,58,45,0.5)] hover:bg-[rgba(31,58,45,0.7)]"
                        }`}
                      >
                        20X
                      </div>
                    </div>
                    <div className="flex items-center bg-[#E9D6B5] rounded px-2 py-1 border-transparent">
                      <input
                        type="text"
                        placeholder="Pesquisar o Laçador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                        className="px-1 py-1 text-xs rounded border mr-1 bg-[#E9D6B5] focus:outline-none w-40 border-[#E9D6B5]"
                      />
                      <Search className="w-3 h-3 text-[rgba(108,26,26,1)]" />
                    </div>
                  </div>
                </div>
              </div>

              {showAddUserForm && !activeForceView && (
                <div className="bg-[#B79256] p-4 border-b border-[#A67B47]">
                  <form onSubmit={handleAddUser} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        onKeyDown={handleAddUserNameKeyDown}
                        placeholder="Digite o nome do usuário..."
                        className="flex-1 px-3 py-2 text-sm border border-[#A67B47] rounded focus:outline-none focus:border-[#1F3A2D]"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newUserEntity}
                        onChange={(e) => setNewUserEntity(e.target.value)}
                        onKeyDown={handleAddUserEntityKeyDown}
                        placeholder="Digite a entidade..."
                        className="flex-1 px-3 py-2 text-sm border border-[#A67B47] rounded focus:outline-none focus:border-[#1F3A2D]"
                      />
                    </div>
                    {forceSelectionEnabled && (
                      <div className="flex items-center gap-2">
                        <input
                          ref={addUserForceInputRef}
                          type="text"
                          value={newUserForce}
                          onChange={(e) => setNewUserForce(e.target.value.toUpperCase())}
                          onKeyDown={handleAddUserForceKeyDown}
                          placeholder="Digite a força (A, B ou C)..."
                          className="flex-1 px-3 py-2 text-sm border border-[#A67B47] rounded focus:outline-none focus:border-[#1F3A2D]"
                          maxLength={1}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1F3A2D] text-white text-sm rounded hover:bg-opacity-80"
                      >
                        Adicionar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddUser}
                        className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-opacity-80"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-[#1F3A2D] mt-2 flex-1 overflow-y-auto overflow-x-hidden max-h-[440px]" data-user-list>
                <div
                  ref={containerRef}
                  className="max-h-[440px] overflow-y-auto overflow-x-hidden"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "transparent transparent",
                    scrollBehavior: "smooth",
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      width: 8px;
                    }
                    div::-webkit-scrollbar-track {
                      background: transparent;
                      opacity: 0;
                    }
                    div::-webkit-scrollbar-thumb {
                      background: rgba(183, 146, 86, 0);
                      border-radius: 4px;
                      opacity: 0;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                      background: rgba(166, 123, 71, 0);
                      opacity: 0;
                    }
                  `}</style>
                  {displayLines.map((line) => {
                    const isEmptyLine = line.id < 0
                    const isEditing = editingLine === line.lineNumber
                    const isHighlighted = highlightedUserId === line.id && !isEmptyLine
                    const searchTermLower = searchTerm.toLowerCase()
                    const isSearchMatch =
                      searchTerm && !isEmptyLine && line.name.toLowerCase().includes(searchTermLower)

                    const { voltas, mataMata } = parseClassification(classificationText)

                    return (
                      <div
                        key={line.lineNumber}
                        ref={(el) => !isEmptyLine && (userRefs.current[line.id] = el)}
                        onClick={() =>
                          !isEmptyLine ? handleExistingLineClick(line.lineNumber) : handleLineClick(line.lineNumber)
                        }
                        onDoubleClick={() => !isEmptyLine && handleLineDoubleClick(line.id)}
                        className={`flex items-center text-black text-sm border-b rounded-3xl mb-2.5 transition-all duration-300 ${
                          isEmptyLine ? "cursor-pointer hover:bg-[#D4C4A8]" : "cursor-pointer"
                        } ${
                          isSearchMatch
                            ? "bg-[#E9D6B5] h-10 shadow-lg"
                            : `bg-[#E9D6B5] h-10 ${searchTerm && !isSearchMatch ? "opacity-20" : ""}`
                        } border-[#A67B47]`}
                      >
                        <div className="p-2 border-r border-[#A67B47] text-center w-14 flex items-center justify-center">
                          <div className="w-8 h-4 bg-[#FFFFFF] rounded-full border-2 border-[rgba(183,146,86,1)]"></div>
                        </div>
                        <div className="p-2 border-r border-[#A67B47] text-center w-14">{line.lineNumber}-</div>
                        <div className="p-2 border-r border-[#A67B47] w-64 font-bold text-center">
                          {isEditing && editingField === "name" ? (
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value.toUpperCase())}
                              onKeyDown={(e) => handleKeyDown(e, line.lineNumber)}
                              className="w-full bg-transparent border-none outline-none text-center"
                              autoFocus
                              placeholder="Digite o nome..."
                            />
                          ) : (
                            line.name
                          )}
                        </div>
                        <div className="p-2 border-[#A67B47] w-64 font-bold text-center border-r-0">
                          {isEditing && editingField === "entity" ? (
                            <input
                              type="text"
                              value={tempEntity}
                              onChange={(e) => setTempEntity(e.target.value.toUpperCase())}
                              onKeyDown={(e) => handleKeyDown(e, line.lineNumber)}
                              className="w-full bg-transparent border-none outline-none text-center"
                              autoFocus
                              placeholder="Digite a entidade..."
                            />
                          ) : (
                            line.entity
                          )}
                        </div>
                        <div className="p-2 border-r border-[#A67B47] text-center font-bold w-14 flex items-center justify-center px-2 ml-2 border-l">
                          {!isEmptyLine ? line.lives : ""}
                        </div>
                        <div
                          className="p-2 border-r border-[#A67B47] text-center font-bold w-14 flex items-center justify-center mr-2 ml-0 border-l-0 cursor-pointer"
                          onClick={(e) => !isEmptyLine && handleForceFieldClick(e, line.lineNumber)}
                        >
                          {!isEmptyLine ? (
                            isEditing && editingField === "force" ? (
                              <input
                                type="text"
                                value={tempForce}
                                onChange={(e) => setTempForce(e.target.value.toUpperCase())}
                                onKeyDown={(e) => handleKeyDown(e, line.lineNumber)}
                                className="w-full bg-transparent border-none outline-none text-center"
                                autoFocus
                                placeholder="A, B ou C"
                                maxLength={1}
                              />
                            ) : (
                              line.force || ""
                            )
                          ) : (
                            ""
                          )}
                        </div>
                        <div className="flex-1 flex justify-center items-center px-4 overflow-x-hidden">
                          <div
                            className="container-quadrados flex items-center px-3 py-3 overflow-x-auto scrollbar-hide"
                            style={{ width: "360px" }}
                          >
                            <div className="flex flex-row mx-0 gap-2">
                              {[...Array(voltas)].map((_, i) => {
                                const key = `${line.lineNumber}-${i}`
                                const score = currentScores[key]
                                const isCurrentPosition =
                                  currentPosition.lineNumber === line.lineNumber && currentPosition.squareIndex === i
                                const isEditing =
                                  editingSquare?.lineNumber === line.lineNumber && editingSquare?.squareIndex === i

                                return (
                                  <div
                                    key={i}
                                    onClick={(e) => handleSquareClick(e, line.lineNumber, i)}
                                    onContextMenu={(e) => handleSquareRightClick(e, line.lineNumber, i)}
                                    className={`h-4 px-3 py-3 w-4 border-2 relative flex items-center justify-center cursor-pointer ${
                                      score ? (score.color === "green" ? "bg-green-500" : "bg-red-500") : "bg-white"
                                    } ${
                                      isCurrentPosition || isEditing
                                        ? "border-yellow-400 border-4"
                                        : "border-[rgba(183,146,86,1)]"
                                    }`}
                                  >
                                    {score && (
                                      <span className="text-white font-bold text-xs absolute">{score.number}</span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            <div style={{ width: "28px" }}></div>
                            <div className="flex gap-2 pr-16 pl-8">
                              {[...Array(mataMata)].map((_, i) => {
                                const key = `${line.lineNumber}-${i + voltas}`
                                const score = currentScores[key]
                                const isCurrentPosition =
                                  currentPosition.lineNumber === line.lineNumber &&
                                  currentPosition.squareIndex === i + voltas
                                const isEditing =
                                  editingSquare?.lineNumber === line.lineNumber &&
                                  editingSquare?.squareIndex === i + voltas

                                return (
                                  <div
                                    key={i + voltas}
                                    onClick={(e) => handleSquareClick(e, line.lineNumber, i + voltas)}
                                    onContextMenu={(e) => handleSquareRightClick(e, line.lineNumber, i + voltas)}
                                    className={`w-4 h-4 px-3 py-3 border-2 relative flex items-center justify-center cursor-pointer ${
                                      score ? (score.color === "green" ? "bg-green-500" : "bg-red-500") : "bg-white"
                                    } ${
                                      isCurrentPosition || isEditing
                                        ? "border-yellow-400 border-4"
                                        : "border-[rgba(183,146,86,1)]"
                                    }`}
                                  >
                                    {score && (
                                      <span className="text-white font-bold text-xs absolute">{score.number}</span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-0.5 mr-2"></div>
                        <div className="w-40"></div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Table Body - Empty for now */}
              <div className="min-h-96" style={{ backgroundColor: "#1F3A2D" }}></div>
            </div>

            {/* Right Sidebar */}
            <div className="w-64 p-4 text-[rgba(183,146,86,1)] rounded-lg bg-[rgba(31,58,45,1)] border border border-2 border-[rgba(183,146,86,1)] h-[68.666667%] my-40">
              <div className="text-black px-3 py-2 rounded text-sm font-bold mb-2 bg-slate-500 text-center w-44">
                QUINTA-FEIRA ▼
              </div>
              <div className="space-y-2">
                {[
                  { time: "14:00", label: "CARICIA" },
                  { time: "15:00", label: "CARICIA" },
                  { time: "16:00", label: "CARICIA" },
                  { time: "18:20", label: "CARICIA" },
                  { time: "16:00", label: "CARICIA" },
                  { time: "12:00", label: "CARICIA" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="py-2 rounded text-sm font-bold text-white border-slate-500 bg-[rgba(183,146,86,1)] px-1.5 w-44"
                  >
                    <div className="flex gap-[35px] items-center">
                      <span className="text-[rgba(108,26,26,1)] bg-transparent">{item.time}</span>
                      <span className="text-black">{`cancha-${(index % 3) + 1}`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Screen Overlay */}
      {showPasswordScreen && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-lg">
              {selectedUserType === "Narrador" ? (
                <img src="/narrator-icon.png" alt="Narrador" className="w-16 h-16 object-contain" />
              ) : selectedUserType === "Juiz" ? (
                <img src="/judge-icon.png" alt="Juiz" className="w-16 h-16 object-contain" />
              ) : selectedUserType === "Laçador" ? (
                <img src="/outros-icon.png" alt="Laçador" className="w-16 h-16 object-contain" />
              ) : selectedUserType === "outros" ? (
                <img src="/outros-icon.png" alt="Outros" className="w-16 h-16 object-contain" />
              ) : (
                <User className="w-16 h-16 text-black" />
              )}
            </div>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col items-center">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="px-6 py-3 pr-12 text-center text-gray-700 bg-white rounded-lg shadow-lg border border-gray-200 mb-4 w-64"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
          <button
            onClick={handleBackFromPassword}
            className="absolute bottom-8 left-8 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            VOLTAR
          </button>
        </div>
      )}

      <div className="absolute top-6 right-6 z-10" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        >
          <User className="w-6 h-6 text-gray-700" />
        </button>
        {isDropdownOpen && (
          <div className="absolute top-20 right-0 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            {userOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleUserSelection(option)}
                className="w-full px-4 py-3 text-center text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {showRodeios && (
          <div
            ref={rodeiosRef}
            className="absolute top-20 right-0 w-20 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 max-h-96 overflow-y-auto scrollbar-hide"
          >
            <div className="flex flex-col items-center">
              {rodeioEvents.map((rodeio, index) => (
                <button
                  key={index}
                  onClick={() => handleRodeioSelection(rodeio.name)}
                  className="w-full p-2 hover:bg-gray-100 transition-colors duration-150 flex flex-col items-center"
                >
                  <img
                    src={rodeio.image || "/placeholder.svg"}
                    alt={rodeio.name}
                    className="w-12 h-12 rounded-full object-cover mb-1"
                  />
                  <span className="text-xs text-gray-700 text-center">{rodeio.name}</span>
                </button>
              ))}

              {selectedUserType === "outros" && (
                <button
                  onClick={handleAddNewRodeio}
                  className="w-full p-2 hover:bg-gray-100 transition-colors duration-150 flex flex-col items-center border-t border-gray-200 mt-2 pt-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1 border-2 border-dashed border-gray-300">
                    <span className="text-2xl text-gray-500">+</span>
                  </div>
                  <span className="text-xs text-gray-700 text-center">Adicionar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showModalityEditor && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Configuração da Modalidade - Etapa {editorStep} de 6
            </h2>

            {/* Step 1: Title and Name */}
            {editorStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Título e Nome da Modalidade</h3>
                <p className="text-gray-600">Altere o nome da modalidade se desejar:</p>
                <input
                  type="text"
                  value={modalityConfig.name}
                  onChange={(e) => setModalityConfig({ ...modalityConfig, name: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[rgba(183,146,86,1)] outline-none"
                  placeholder="Ex: INDIVIDUAL DA SOCIEDADE"
                />
                <p className="text-sm text-gray-500">
                  O retângulo ajustará automaticamente sua largura conforme o tamanho do nome.
                </p>
              </div>
            )}

            {/* Step 2: Classification Info */}
            {editorStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Informações de Classificação</h3>
                <p className="text-gray-600">Configure o formato da classificação:</p>
                <input
                  type="text"
                  value={modalityConfig.classificationText}
                  onChange={(e) =>
                    setModalityConfig({ ...modalityConfig, classificationText: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[rgba(183,146,86,1)] outline-none"
                  placeholder="Ex: 3 VOLTAS + 5 DE MATA-MATA"
                />
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 font-semibold mb-2">Exemplos:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "3 VOLTAS + 5 DE MATA-MATA" → 3 quadrados de classificação + 5 de mata-mata</li>
                    <li>• "2 VOLTAS + 5 DE MATA-MATA" → 2 quadrados + 5 de mata-mata</li>
                    <li>• "ELIMINATÓRIA" → Erro para fora (59 quadrados)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Forces Selection */}
            {editorStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Forças Ativas</h3>
                <p className="text-gray-600">Selecione quais forças estarão ativas nesta modalidade:</p>
                <div className="grid grid-cols-4 gap-4">
                  {["A", "B", "C", "D"].map((force) => (
                    <div key={force} className="flex flex-col items-center gap-2">
                      <div className="text-2xl font-bold text-gray-700">{force}</div>
                      <input
                        type="checkbox"
                        checked={modalityConfig.forcesEnabled[force as "A" | "B" | "C" | "D"]}
                        onChange={(e) =>
                          setModalityConfig({
                            ...modalityConfig,
                            forcesEnabled: {
                              ...modalityConfig.forcesEnabled,
                              [force]: e.target.checked,
                            },
                          })
                        }
                        className="w-6 h-6 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  As forças selecionadas aparecerão na interface de classificação.
                </p>
              </div>
            )}

            {/* Step 4: Force Requirements */}
            {editorStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Critérios de Classificação por Força</h3>
                <p className="text-gray-600">Defina quantos acertos são necessários para cada força:</p>
                <div className="space-y-4">
                  {["A", "B", "C", "D"].map(
                    (force) =>
                      modalityConfig.forcesEnabled[force as "A" | "B" | "C" | "D"] && (
                        <div key={force} className="flex items-center gap-4">
                          <label className="text-lg font-semibold text-gray-700 w-20">Força {force}:</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={modalityConfig.forceRequirements[force as "A" | "B" | "C" | "D"]}
                            onChange={(e) =>
                              setModalityConfig({
                                ...modalityConfig,
                                forceRequirements: {
                                  ...modalityConfig.forceRequirements,
                                  [force]: Number.parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[rgba(183,146,86,1)] outline-none"
                          />
                          <span className="text-gray-600">quadrados verdes necessários</span>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Error Rules */}
            {editorStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Regras de Erro</h3>
                <p className="text-gray-600">Defina quando o competidor pode errar:</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="errorRule"
                      checked={modalityConfig.errorRules.allowedRound === 0}
                      onChange={() =>
                        setModalityConfig({
                          ...modalityConfig,
                          errorRules: { allowedRound: 0 },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700">Nenhum erro permitido (mata-mata direto)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="errorRule"
                      checked={modalityConfig.errorRules.allowedRound === 1}
                      onChange={() =>
                        setModalityConfig({
                          ...modalityConfig,
                          errorRules: { allowedRound: 1 },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700">Podendo errar na primeira volta</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="errorRule"
                      checked={modalityConfig.errorRules.allowedRound === 2}
                      onChange={() =>
                        setModalityConfig({
                          ...modalityConfig,
                          errorRules: { allowedRound: 2 },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700">Podendo errar na segunda volta</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="errorRule"
                      checked={modalityConfig.errorRules.allowedRound === -1}
                      onChange={() =>
                        setModalityConfig({
                          ...modalityConfig,
                          errorRules: { allowedRound: -1 },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700">Podendo errar em qualquer volta</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 6: Summary */}
            {editorStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Resumo da Configuração</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="font-semibold">Nome:</span> {modalityConfig.name}
                  </div>
                  <div>
                    <span className="font-semibold">Classificação:</span> {modalityConfig.classificationText}
                  </div>
                  <div>
                    <span className="font-semibold">Forças Ativas:</span>{" "}
                    {Object.entries(modalityConfig.forcesEnabled)
                      .filter(([_, enabled]) => enabled)
                      .map(([force]) => force)
                      .join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold">Requisitos:</span>
                    <ul className="ml-4 mt-1">
                      {Object.entries(modalityConfig.forceRequirements).map(
                        ([force, req]) =>
                          modalityConfig.forcesEnabled[force as "A" | "B" | "C" | "D"] && (
                            <li key={force}>
                              Força {force}: {req} acertos
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold">Regra de Erro:</span>{" "}
                    {modalityConfig.errorRules.allowedRound === 0 && "Nenhum erro permitido"}
                    {modalityConfig.errorRules.allowedRound === 1 && "Pode errar na primeira volta"}
                    {modalityConfig.errorRules.allowedRound === 2 && "Pode errar na segunda volta"}
                    {modalityConfig.errorRules.allowedRound === -1 && "Pode errar em qualquer volta"}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setShowModalityEditor(false)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                CANCELAR
              </button>
              <div className="flex gap-3">
                {editorStep > 1 && (
                  <button
                    onClick={handleModalityEditorPrev}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    ANTERIOR
                  </button>
                )}
                {editorStep < 6 ? (
                  <button
                    onClick={handleModalityEditorNext}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    PRÓXIMO
                  </button>
                ) : (
                  <button
                    onClick={handleSaveModalityConfig}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    SALVAR
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

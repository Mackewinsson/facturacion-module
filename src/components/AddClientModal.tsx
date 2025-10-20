'use client'
import { useState } from 'react'
import { Cliente, TipoCliente, Entidad, TipoEntidad } from '@/lib/mock-data'
import BaseModal from './BaseModal'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: (client: Cliente | Entidad) => void
  suggestedName?: string
  isEntityModal?: boolean
}

type ContactType = 'empresa' | 'persona'
type TabType = 'basico' | 'cuentas' | 'preferencias' | 'contabilidad'

export default function AddClientModal({ isOpen, onClose, onClientAdded, suggestedName = '', isEntityModal = false }: AddClientModalProps) {
  const [contactType, setContactType] = useState<ContactType>('empresa')
  const [activeTab, setActiveTab] = useState<TabType>('basico')
  const [formData, setFormData] = useState({
    // Entity Identification
    NIF: '',
    razonSocial: suggestedName,
    nombreComercial: '',
    
    // Dates
    fechaAlta: new Date().toISOString().split('T')[0],
    fechaBaja: '',
    
    // Type and Classification
    personaFisica: false,
    tipoIdentificador: 'NIF/CIF-IVA' as 'NIF/CIF-IVA' | 'NIE' | 'PASAPORTE' | 'OTRO',
    paisOrigen: 'ESPAÑA',
    extranjero: false,
    operadorIntracomunitario: false,
    importacionExportacion: false,
    regimenCanario: false,
    
    // Entity Relationships
    proveedor: false,
    cliente: true,
    vendedor: false,
    operarioTaller: false,
    aseguradora: false,
    financiera: false,
    agenciaTransporte: false,
    banco: false,
    rentacar: false,
    
    // Currency and Additional Info
    monedaEntidad: 'Eur',
    
    // Contact Information
    telefono: '',
    email: '',
    movil: '',
    website: '',
    identificacionVAT: '',
    tags: '',
    tipoContacto: 'Sin especificar',
    domicilio: {
      calle: '',
      codigoPostal: '',
      municipio: '',
      provincia: '',
      pais: 'España'
    },
    
    // Legacy fields for compatibility
    tipoEntidad: 'cliente' as TipoEntidad,
    tipo: 'empresario/profesional' as TipoCliente,
    nombreORazonSocial: suggestedName,
    pais: 'España'
  })

  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = field.split('.')
      
      if (keys.length === 1) {
        newData[keys[0] as keyof typeof newData] = value
      } else if (keys.length === 2) {
        if (!newData[keys[0] as keyof typeof newData]) {
          newData[keys[0] as keyof typeof newData] = {} as any
        }
        (newData[keys[0] as keyof typeof newData] as any)[keys[1]] = value
      } else if (keys.length === 3) {
        if (!newData[keys[0] as keyof typeof newData]) {
          newData[keys[0] as keyof typeof newData] = {} as any
        }
        if (!(newData[keys[0] as keyof typeof newData] as any)[keys[1]]) {
          (newData[keys[0] as keyof typeof newData] as any)[keys[1]] = {}
        }
        (newData[keys[0] as keyof typeof newData] as any)[keys[1]][keys[2]] = value
      }
      
      return newData
    })
  }

  const handleContactTypeChange = (type: ContactType) => {
    setContactType(type)
    setFormData(prev => ({
      ...prev,
      tipo: type === 'empresa' ? 'empresario/profesional' : 'particular'
    }))
  }

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!formData.razonSocial.trim()) {
      newErrors.push('La razón social es obligatoria')
    }
    
    if (!formData.NIF.trim()) {
      newErrors.push('El NIF es obligatorio')
    }
    
    if (!formData.personaFisica && !formData.domicilio.calle.trim()) {
      newErrors.push('La dirección es obligatoria para empresas')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onClientAdded(formData)
      onClose()
      // Reset form
      setFormData({
        // Entity Identification
        NIF: '',
        razonSocial: '',
        nombreComercial: '',
        
        // Dates
        fechaAlta: new Date().toISOString().split('T')[0],
        fechaBaja: '',
        
        // Type and Classification
        personaFisica: false,
        tipoIdentificador: 'NIF/CIF-IVA',
        paisOrigen: 'ESPAÑA',
        extranjero: false,
        operadorIntracomunitario: false,
        importacionExportacion: false,
        regimenCanario: false,
        
        // Entity Relationships
        proveedor: false,
        cliente: true,
        vendedor: false,
        operarioTaller: false,
        aseguradora: false,
        financiera: false,
        agenciaTransporte: false,
        banco: false,
        rentacar: false,
        
        // Currency and Additional Info
        monedaEntidad: 'Eur',
        
        // Contact Information
        telefono: '',
        email: '',
        movil: '',
        website: '',
        identificacionVAT: '',
        tags: '',
        tipoContacto: 'Sin especificar',
        domicilio: {
          calle: '',
          codigoPostal: '',
          municipio: '',
          provincia: '',
          pais: 'España'
        },
        
        // Legacy fields for compatibility
        tipoEntidad: 'cliente' as TipoEntidad,
        tipo: 'empresario/profesional',
        nombreORazonSocial: '',
        pais: 'España'
      })
      setErrors([])
    }
  }

  const handleClose = () => {
    onClose()
    setErrors([])
  }

  const tabs = [
    { id: 'basico', label: 'Básico' },
    { id: 'cuentas', label: 'Cuentas' },
    { id: 'preferencias', label: 'Preferencias' },
    { id: 'contabilidad', label: 'Contabilidad' }
  ]

  if (!isOpen) return null

  const footer = (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="px-4 py-2 text-secondary-foreground bg-secondary rounded-md hover:bg-secondary/80 font-medium"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="entity-form"
        className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 font-medium"
      >
        Crear
      </button>
    </>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEntityModal ? 'Nueva Entidad' : 'Nuevo contacto'}
      footer={footer}
      maxWidth="4xl"
    >

          {/* Entity Type Selection (only for entity modal) */}
          {isEntityModal && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-card-foreground mb-3">Tipo de Entidad</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('tipoEntidad', 'cliente')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    formData.tipoEntidad === 'cliente'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('tipoEntidad', 'proveedor')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    formData.tipoEntidad === 'proveedor'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Proveedor
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('tipoEntidad', 'vendedor')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    formData.tipoEntidad === 'vendedor'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Vendedor
                </button>
              </div>
            </div>
          )}

          {/* Contact Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-3">Este contacto es...</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleContactTypeChange('empresa')}
                className={`px-4 py-2 rounded-md font-medium ${
                  contactType === 'empresa'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Empresa
              </button>
              <button
                type="button"
                onClick={() => handleContactTypeChange('persona')}
                className={`px-4 py-2 rounded-md font-medium ${
                  contactType === 'persona'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Persona
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          {/* <div className="mb-6">
            <div className="border-b border-border">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div> */}

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-900 rounded">
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm font-medium">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form id="entity-form" onSubmit={handleSubmit}>
            {activeTab === 'basico' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Entity Identification */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">NIF</label>
                    <input
                      type="text"
                      value={formData.NIF}
                      onChange={(e) => handleInputChange('NIF', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="NIF"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Razón Social</label>
                    <input
                      type="text"
                      value={formData.razonSocial}
                      onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Razón Social"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">N. Comercial</label>
                    <input
                      type="text"
                      value={formData.nombreComercial}
                      onChange={(e) => handleInputChange('nombreComercial', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Nombre Comercial"
                    />
                  </div>
                  
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Alta</label>
                      <input
                        type="date"
                        value={formData.fechaAlta}
                        onChange={(e) => handleInputChange('fechaAlta', e.target.value)}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Baja</label>
                      <input
                        type="date"
                        value={formData.fechaBaja}
                        onChange={(e) => handleInputChange('fechaBaja', e.target.value)}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.personaFisica}
                      onChange={(e) => handleInputChange('personaFisica', e.target.checked)}
                      className="mr-2"
                    />
                    <label className="text-sm text-card-foreground">Persona física</label>
                  </div>
                  
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Verificar datos con Hacienda
                  </button>
                  
                  {/* Type and Classification */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Tipo Identificador</label>
                    <select
                      value={formData.tipoIdentificador}
                      onChange={(e) => handleInputChange('tipoIdentificador', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="NIF/CIF-IVA">NIF/CIF-IVA</option>
                      <option value="NIE">NIE</option>
                      <option value="PASAPORTE">PASAPORTE</option>
                      <option value="OTRO">OTRO</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">País de origen</label>
                    <select
                      value={formData.paisOrigen}
                      onChange={(e) => handleInputChange('paisOrigen', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="ESPAÑA">ESPAÑA</option>
                      <option value="FRANCIA">FRANCIA</option>
                      <option value="PORTUGAL">PORTUGAL</option>
                      <option value="ITALIA">ITALIA</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.extranjero}
                        onChange={(e) => handleInputChange('extranjero', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm text-card-foreground">Extranjero/a</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.operadorIntracomunitario}
                        onChange={(e) => handleInputChange('operadorIntracomunitario', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm text-card-foreground">Operador intracomunitario</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.importacionExportacion}
                        onChange={(e) => handleInputChange('importacionExportacion', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm text-card-foreground">Importación/Exportación</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.regimenCanario}
                        onChange={(e) => handleInputChange('regimenCanario', e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm text-card-foreground">Régimen Canario</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Dirección</label>
                    <input
                      type="text"
                      value={formData.domicilio.calle}
                      onChange={(e) => handleInputChange('domicilio.calle', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Dirección"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Población</label>
                      <input
                        type="text"
                        value={formData.domicilio.municipio}
                        onChange={(e) => handleInputChange('domicilio.municipio', e.target.value)}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                        placeholder="Población"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Código postal</label>
                      <input
                        type="text"
                        value={formData.domicilio.codigoPostal}
                        onChange={(e) => handleInputChange('domicilio.codigoPostal', e.target.value)}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                        placeholder="Código postal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Provincia</label>
                    <input
                      type="text"
                      value={formData.domicilio.provincia}
                      onChange={(e) => handleInputChange('domicilio.provincia', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Provincia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">País</label>
                    <select
                      value={formData.domicilio.pais}
                      onChange={(e) => handleInputChange('domicilio.pais', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="España">España</option>
                      <option value="Francia">Francia</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Italia">Italia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Nombre comercial</label>
                    <input
                      type="text"
                      value={formData.nombreComercial}
                      onChange={(e) => handleInputChange('nombreComercial', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Nombre comercial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Identificación VAT</label>
                    <input
                      type="text"
                      value={formData.identificacionVAT}
                      onChange={(e) => handleInputChange('identificacionVAT', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Identificación VAT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Asignar usuarios</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Usuarios"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Modification Details */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-sm text-gray-600 mb-1">Modificado por:</div>
                    <div className="text-sm font-medium">USUARIO6, DEMO</div>
                    <div className="text-sm text-gray-600 mb-1 mt-2">El día:</div>
                    <div className="text-sm font-medium">03/12/2024 12:02:00</div>
                  </div>
                  
                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Moneda de la entidad</label>
                    <select
                      value={formData.monedaEntidad}
                      onChange={(e) => handleInputChange('monedaEntidad', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="Eur">Eur</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  
                  {/* Relationships */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Relaciones</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.proveedor}
                          onChange={(e) => handleInputChange('proveedor', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Proveedor</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.cliente}
                          onChange={(e) => handleInputChange('cliente', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Cliente</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.vendedor}
                          onChange={(e) => handleInputChange('vendedor', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Vendedor</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.operarioTaller}
                          onChange={(e) => handleInputChange('operarioTaller', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Operario de Taller</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.aseguradora}
                          onChange={(e) => handleInputChange('aseguradora', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Aseguradora</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.financiera}
                          onChange={(e) => handleInputChange('financiera', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Financiera</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.agenciaTransporte}
                          onChange={(e) => handleInputChange('agenciaTransporte', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Agencia de Transporte</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.banco}
                          onChange={(e) => handleInputChange('banco', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Banco</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.rentacar}
                          onChange={(e) => handleInputChange('rentacar', e.target.checked)}
                          className="mr-2"
                        />
                        <label className="text-sm text-card-foreground">Rentacar</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Email"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                        placeholder="Teléfono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Móvil</label>
                      <input
                        type="tel"
                        value={formData.movil}
                        onChange={(e) => handleInputChange('movil', e.target.value)}
                        className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                        placeholder="Móvil"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Website"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Tags</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                      placeholder="Tags"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Tipo de contacto</label>
                    <select
                      value={formData.tipoContacto}
                      onChange={(e) => handleInputChange('tipoContacto', e.target.value)}
                      className="w-full px-3 py-2 border border-input-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-foreground"
                    >
                      <option value="Sin especificar">Sin especificar</option>
                      <option value="Cliente">Cliente</option>
                      <option value="Proveedor">Proveedor</option>
                      <option value="Cliente y Proveedor">Cliente y Proveedor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* {activeTab === 'cuentas' && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Contenido de la pestaña Cuentas</p>
              </div>
            )}

            {activeTab === 'preferencias' && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Contenido de la pestaña Preferencias</p>
              </div>
            )}

            {activeTab === 'contabilidad' && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Contenido de la pestaña Contabilidad</p>
              </div>
            )} */}

          </form>
    </BaseModal>
  )
}

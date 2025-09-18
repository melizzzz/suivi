const fs = require('fs').promises;
const path = require('path');

/**
 * Classe utilitaire pour gérer les fichiers JSON
 */
class JSONDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
  }

  /**
   * Lire un fichier JSON
   * @param {string} filename - nom du fichier (sans extension)
   * @returns {Promise<Array>} - contenu du fichier
   */
  async read(filename) {
    try {
      const filePath = path.join(this.dataDir, `${filename}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Si le fichier n'existe pas, retourner un tableau vide
        await this.write(filename, []);
        return [];
      }
      throw error;
    }
  }

  /**
   * Écrire dans un fichier JSON
   * @param {string} filename - nom du fichier (sans extension)
   * @param {Array} data - données à écrire
   * @returns {Promise<void>}
   */
  async write(filename, data) {
    try {
      const filePath = path.join(this.dataDir, `${filename}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`Erreur lors de l'écriture du fichier ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Générer un ID unique
   * @returns {string} - ID unique basé sur timestamp
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Ajouter un élément
   * @param {string} filename - nom du fichier
   * @param {Object} item - élément à ajouter
   * @returns {Promise<Object>} - élément ajouté avec ID
   */
  async add(filename, item) {
    const data = await this.read(filename);
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    data.push(newItem);
    await this.write(filename, data);
    return newItem;
  }

  /**
   * Mettre à jour un élément
   * @param {string} filename - nom du fichier
   * @param {string} id - ID de l'élément
   * @param {Object} updates - modifications à apporter
   * @returns {Promise<Object|null>} - élément mis à jour ou null
   */
  async update(filename, id, updates) {
    const data = await this.read(filename);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    await this.write(filename, data);
    return data[index];
  }

  /**
   * Supprimer un élément
   * @param {string} filename - nom du fichier
   * @param {string} id - ID de l'élément
   * @returns {Promise<boolean>} - true si supprimé, false sinon
   */
  async delete(filename, id) {
    const data = await this.read(filename);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }
    
    data.splice(index, 1);
    await this.write(filename, data);
    return true;
  }

  /**
   * Trouver un élément par ID
   * @param {string} filename - nom du fichier
   * @param {string} id - ID de l'élément
   * @returns {Promise<Object|null>} - élément trouvé ou null
   */
  async findById(filename, id) {
    const data = await this.read(filename);
    return data.find(item => item.id === id) || null;
  }

  /**
   * Trouver des éléments selon des critères
   * @param {string} filename - nom du fichier
   * @param {Function} predicate - fonction de filtre
   * @returns {Promise<Array>} - éléments trouvés
   */
  async findWhere(filename, predicate) {
    const data = await this.read(filename);
    return data.filter(predicate);
  }
}

module.exports = new JSONDatabase();

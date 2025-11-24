import React, { useState, useCallback } from 'react';
import { Search, Package, FileText, DollarSign, AlertCircle, CheckCircle, Loader2, Zap, Tag } from 'lucide-react';

// --- CUSTOM COMPONENT WRAPPERS (Replaced external imports) ---
const Alert = ({ children, variant, className }) => <div className={`p-4 rounded-lg flex items-start space-x-3 ${variant === 'destructive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} ${className}`}>{children}</div>;
const AlertDescription = ({ children }) => <p className="text-sm">{children}</p>;
const Card = ({ children, className }) => <div className={`bg-white rounded-xl shadow-2xl ${className}`}>{children}</div>;
const CardHeader = ({ children, className }) => <div className={`p-6 border-b border-gray-100 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }) => <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
const CardContent = ({ children, className }) => <div className={`p-6 ${className}`}>{children}</div>;
const Input = ({ id, name, value, onChange, placeholder, className, required = false }) => (
  <input
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${className}`}
  />
);
const Button = ({ onClick, disabled, className, children, variant = 'default', type = 'button' }) => {
  let style = 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 transition duration-150 transform hover:scale-[1.01]';
  if (variant === 'outline') {
    style = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition duration-150';
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`font-medium py-2 px-4 rounded-lg shadow-md ${style} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};
const Label = ({ htmlFor, children, className }) => <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>{children}</label>;
// --- END CUSTOM COMPONENT WRAPPERS ---


export default function ProductLookupTool() {
  const [formData, setFormData] = useState({
    productName: '',
    brandName: '',
    upc: '',
    size: '',
    color: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Determine if essential fields are filled
  const isFormValid = formData.productName.trim() && formData.brandName.trim() && formData.upc.trim();

  const handleInputChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Clear previous errors before checking validation
    setError(null); 
    
    if (!isFormValid) {
        setError("Please fill in the Product Name, Brand Name, and UPC.");
        return;
    }

    setLoading(true);
    setResult(null);

    // Prepare data for the GET request (using URLSearchParams)
    const params = new URLSearchParams(formData).toString();
    // Ensure the API URL is correct
    const apiUrl = `https://highstock-backend.madhavbaveja.in/api/lookup?${params}`;

    try {
      // Using GET method to match the Flask backend
      const response = await fetch(apiUrl, { method: 'GET' });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific 404/400 errors from the backend
        const errorMessage = data.error || 'Failed to retrieve product data.';
        const partial = data.partial_result ? JSON.stringify(data.partial_result, null, 2) : null;

        if (response.status === 404 && partial) {
            setError(`${errorMessage}\n\nPartial AI Result Found:\n${partial}`);
        } else {
            setError(errorMessage);
        }
        
        // Throw an error to stop execution and ensure 'finally' runs
        throw new Error(errorMessage); 
      }

      setResult(data);
    } catch (err) {
      // The error is already set above, so only log here if it was a network/parsing error
      if (!error) { 
          // Catch network or JSON parsing errors
          setError(`An unexpected error occurred: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ productName: '', brandName: '', upc: '', size: '', color: '' });
    setResult(null);
    setError(null);
  };

  const renderResultDetail = (Icon, label, value, colorClass) => (
    <div className={`flex items-start gap-4 p-4 ${colorClass} rounded-xl`}>
      <Icon className="w-6 h-6 flex-shrink-0 mt-1 text-gray-900" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-lg font-semibold text-gray-900 leading-snug">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-10 py-6 bg-white rounded-xl shadow-lg border-t-4 border-indigo-600">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Package className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Highstock Product Lookup
            </h1>
          </div>
          <p className="text-gray-600 text-base max-w-xl mx-auto">
            Instantly retrieve detailed product information (MSRP, description, images) using UPC or descriptive details.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Lookup Form - Lg: 2/5 width */}
          <Card className="shadow-2xl lg:col-span-2 h-fit sticky top-8">
            <CardHeader className="bg-indigo-600 rounded-t-xl border-none">
              <CardTitle className="flex items-center gap-2 text-white">
                <Search className="w-5 h-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="e.g., Pro Filt'r Foundation"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="brandName">Brand Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="brandName"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    placeholder="e.g., Fenty Beauty"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="upc">UPC/Barcode <span className="text-red-500">*</span></Label>
                  <Input
                    id="upc"
                    name="upc"
                    value={formData.upc}
                    onChange={handleInputChange}
                    placeholder="e.g., 123456789012"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size">Size (Optional)</Label>
                    <Input
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="e.g., 30ml, 1oz"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color/Shade (Optional)</Label>
                    <Input
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="e.g., 190, Ruby Red"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Lookup Product
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    type="button"
                    className="px-6"
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Display - Lg: 3/5 width */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="shadow-lg border-l-4 border-red-500">
                <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
                <AlertDescription className="whitespace-pre-line ml-3">{error}</AlertDescription>
              </Alert>
            )}

            {/* Found Result */}
            {result && (
              <Card className="shadow-2xl">
                <CardHeader className="bg-green-600 rounded-t-xl border-none">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    Product Successfully Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  
                  {/* Image and Basic Info */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Image */}
                    <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center w-full sm:w-1/3 flex-shrink-0 border border-gray-200">
                      <img
                        src={result.image_url && result.image_url.length > 0 ? result.image_url[0] : 'https://placehold.co/200x200/cccccc/333333?text=No+Image'}
                        alt={result.product_name || 'Product'}
                        className="max-h-48 max-w-full rounded-lg object-contain"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = 'https://placehold.co/200x200/cccccc/333333?text=Image+Failed';
                        }}
                      />
                    </div>

                    {/* Core Details */}
                    <div className="flex-1 space-y-4">
                      {renderResultDetail(
                        Package,
                        'Product Name',
                        result.product_name,
                        'bg-indigo-50 border border-indigo-200'
                      )}
                      {renderResultDetail(
                        DollarSign,
                        'MSRP (Manufacturer Suggested Retail Price)',
                        result.msrp || 'N/A',
                        'bg-green-50 border border-green-200'
                      )}
                      {result.match_confidence !== undefined && (
                        renderResultDetail(
                          Zap,
                          'Match Confidence',
                          `${result.match_confidence}%`,
                          'bg-yellow-50 border border-yellow-200'
                        )
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {result.description && (
                    <Card className="shadow-none border border-gray-200 bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Product Description</p>
                            <p className="text-gray-900 leading-relaxed text-base">{result.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Source Footer */}
                  {result.source && (
                    <div className="text-sm text-gray-500 pt-2 flex items-center justify-center gap-2 border-t border-gray-100 mt-4">
                        <Tag className="w-4 h-4" />
                        Source: <span className="font-semibold text-gray-700">{result.source}</span>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}

            {/* Initial State / Empty State */}
            {!result && !error && !loading && (
              <Card className="shadow-2xl">
                <CardContent className="pt-6">
                  <div className="text-center py-16">
                    <Search className="w-20 h-20 text-indigo-200 mx-auto mb-6" />
                    <p className="text-gray-500 text-lg font-medium">
                      Start your search by entering the product details on the left.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      We'll check UPC databases first, then use advanced AI search as a fallback.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}